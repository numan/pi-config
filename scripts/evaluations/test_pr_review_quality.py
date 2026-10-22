"""Focused CLI-boundary tests; no model calls or private application source."""
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch
from types import SimpleNamespace

SPEC = importlib.util.spec_from_file_location('replay', Path(__file__).with_name('pr_review_quality.py'))
replay = importlib.util.module_from_spec(SPEC)


class ReplayTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        SPEC.loader.exec_module(replay)

    def test_extracts_committed_bytes_without_mutating_checkout(self):
        with tempfile.TemporaryDirectory() as tmp:
            repo = Path(tmp) / 'repo'
            repo.mkdir()
            def git(*args):
                return subprocess.check_output(['git', '-C', str(repo), *args]).decode().strip()
            git('init', '-q')
            git('config', 'user.email', 'test@example.invalid')
            git('config', 'user.name', 'Test')
            (repo / 'sample.rb').write_text('committed\n')
            git('add', '.')
            git('commit', '-qm', 'fixture')
            head = git('rev-parse', 'HEAD')
            (repo / 'sample.rb').write_text('uncommitted\n')
            output = Path(tmp) / 'out'
            replay.extract(repo, head, ['sample.rb'], output)
            self.assertEqual((output / 'sample.rb').read_text(), 'committed\n')
            self.assertEqual((repo / 'sample.rb').read_text(), 'uncommitted\n')
            self.assertEqual(git('status', '--porcelain'), 'M sample.rb')

    def test_freeze_uses_git_baseline_and_disk_candidate_once(self):
        with tempfile.TemporaryDirectory() as tmp:
            repo = Path(tmp)
            def git(*args):
                return subprocess.check_output(['git', '-C', str(repo), *args]).decode().strip()
            git('init', '-q')
            git('config', 'user.email', 'test@example.invalid')
            git('config', 'user.name', 'Test')
            for skill in replay.SKILLS:
                path = repo / 'skills' / skill / 'SKILL.md'
                path.parent.mkdir(parents=True)
                path.write_text(f'{skill} baseline')
            role = repo / 'agents/code-quality.md'
            role.parent.mkdir()
            role.write_text('---\nname: code-quality\n---\nBaseline role body')
            (repo / 'settings.json').write_text('{}')
            git('add', '.')
            git('commit', '-qm', 'baseline')
            baseline = git('rev-parse', 'HEAD')
            (repo / 'skills/code-reviewer/SKILL.md').write_text('candidate revision')
            role.write_text('---\nname: code-quality\n---\nCandidate maintainability role')
            root = repo / 'artifact'
            root.mkdir()
            replay.dump(root / 'manifest.json', {'policy_status': 'awaiting readiness'})
            # Git stays real; only the CLI version probe is replaced, never inference.
            original = subprocess.check_output
            def check_output(command, **kwargs):
                return b'test\n' if command == ['pi', '--version'] else original(command, **kwargs)
            args = SimpleNamespace(root=root, provider='fixture', model='fixture', thinking='high')
            with patch.object(replay, 'CONFIG', repo), patch.object(replay, 'BASELINE', baseline), \
                 patch.object(replay.subprocess, 'check_output', side_effect=check_output):
                replay.freeze(args)
                with self.assertRaisesRegex(ValueError, 'already frozen'):
                    replay.freeze(args)
            old = (root / 'policies/baseline/policy.md').read_text()
            new = (root / 'policies/candidate/policy.md').read_text()
            self.assertIn('Baseline role body', old)
            self.assertIn('Candidate maintainability role', new)
            self.assertNotIn('Candidate maintainability role', old)
            self.assertLess(old.index('Baseline role body'), old.index('code-simplifier baseline'))
            self.assertIn('code-reviewer baseline', old)
            self.assertNotIn('candidate revision', old)
            self.assertIn('candidate revision', new)
            record = json.loads((root / 'manifest.json').read_text())
            self.assertEqual(record['skill_order'], replay.SKILLS)
            self.assertEqual(record['policy_order'], ['agents/code-quality.md',
                             *[f'skills/{s}/SKILL.md' for s in replay.SKILLS]])
            self.assertEqual(record['policy_status'], 'frozen')
            self.assertEqual(record['policies']['candidate']['combined_sha256'], replay.digest(new.encode()))

    def test_manifest_detects_input_mutation(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'file').write_text('before')
            hashes = replay.tree_hashes(root)
            replay.verify_tree(root, hashes)
            (root / 'file').write_text('after')
            with self.assertRaisesRegex(ValueError, 'changed'):
                replay.verify_tree(root, hashes)

    def test_json_success_requires_settled_and_final_response(self):
        assistant = {'type': 'message_end', 'message': {'role': 'assistant',
                     'stopReason': 'stop', 'content': [{'type': 'text', 'text': 'No findings.'}]}}
        settled = {'type': 'agent_settled', 'aborted': False}
        result = replay.analyze_events([assistant, settled], Path('/input'))
        self.assertTrue(result['valid'])
        self.assertEqual(result['report'], 'No findings.')
        for events in ([assistant], [settled], [assistant, {**settled, 'aborted': True}]):
            self.assertFalse(replay.analyze_events(events, Path('/input'))['valid'])
        assistant['message']['stopReason'] = 'length'
        self.assertFalse(replay.analyze_events([assistant, settled], Path('/input'))['valid'])

    def test_outside_reads_and_unexpected_tools_invalidate_trial(self):
        for name, args in [('read', {'path': '../rubric.json'}),
                           ('read', {'path': '/etc/passwd'}),
                           ('bash', {'command': 'true'})]:
            result = replay.analyze_events([{'type': 'tool_execution_start', 'toolName': name,
                                           'args': args}], Path('/input'))
            self.assertTrue(result['violations'])
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'escape').symlink_to('/etc')
            result = replay.analyze_events([{'type': 'tool_execution_start', 'toolName': 'read',
                                           'args': {'path': 'escape/passwd'}}], root)
            self.assertTrue(result['violations'])

    def test_trial_captures_trace_effort_and_refuses_overwrite(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'settings.json').write_text('{}')
            source = root / 'inputs/development'
            source.mkdir(parents=True)
            (source / 'REVIEW.md').write_text('Review this')
            policy = root / 'policies/baseline/policy.md'
            policy.parent.mkdir(parents=True)
            policy.write_text('Fixture policy')
            (root / 'task.txt').write_text('Review')
            replay.dump(root / 'manifest.json', {
                'policy_status': 'frozen',
                'profile': {'settings_sha256': replay.digest(b'{}'), 'pi_version': 'test',
                            'provider': 'fixture', 'model': 'fixture', 'thinking': 'high'},
                'task_sha256': replay.digest(b'Review'),
                'inputs': {'development': replay.tree_hashes(source)},
                'policies': {'baseline': {'combined_sha256': replay.digest(policy.read_bytes())}}})
            def invoke(command, **kwargs):
                self.assertEqual(kwargs['stdin'], subprocess.DEVNULL)
                events = [
                    {'type': 'tool_execution_start', 'toolName': 'read', 'args': {'path': 'REVIEW.md'}},
                    {'type': 'message_end', 'message': {'role': 'assistant', 'stopReason': 'stop',
                     'content': [{'type': 'text', 'text': 'No findings.'}]}},
                    {'type': 'agent_settled', 'aborted': False}]
                kwargs['stdout'].write(''.join(json.dumps(e) + '\n' for e in events))
                return SimpleNamespace(returncode=0)
            args = SimpleNamespace(root=root, case='development', variant='baseline', trial=1, timeout=1)
            with patch.object(replay, 'CONFIG', root), \
                 patch.object(replay.subprocess, 'check_output', return_value=b'test\n'), \
                 patch.object(replay.subprocess, 'run', side_effect=invoke):
                replay.run(args)
                with self.assertRaises(FileExistsError):
                    replay.run(args)
            output = root / 'runs/development/1-baseline'
            record = json.loads((output / 'run.json').read_text())
            self.assertTrue(record['valid'])
            self.assertTrue(record['inputs_unchanged'])
            self.assertEqual(record['tool_calls'], 1)
            self.assertGreaterEqual(record['elapsed_seconds'], 0)
            self.assertEqual((output / 'report.md').read_text(), 'No findings.')
            self.assertEqual(len((output / 'trace.jsonl').read_text().splitlines()), 3)

    def test_command_excludes_discovery_writes_and_session_inheritance(self):
        command = replay.pi_command(Path('/policy.md'), 'task', 'openai-codex', 'gpt-6-astra', 'high')
        for flag in ['--no-session', '--no-context-files', '--no-skills', '--no-extensions',
                     '--no-prompt-templates', '--no-mcp', '--no-approve', '--offline']:
            self.assertIn(flag, command)
        self.assertEqual(command[command.index('--tools') + 1], 'read,grep,find,ls')
        self.assertNotIn('--continue', command)
        self.assertIn('--system-prompt', command)
        self.assertIn('--append-system-prompt', command)


if __name__ == '__main__':
    unittest.main()
