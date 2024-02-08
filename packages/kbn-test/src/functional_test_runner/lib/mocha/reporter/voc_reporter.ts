import { Lifecycle, Config as FTRConfig } from "@kbn/test";
import { Runner, Runnable, Suite, Test } from '@kbn/test/src/functional_test_runner/fake_mocha_types';
import { PathLike, WriteStream, createWriteStream } from "fs";

enum VoCEventType {
    HOOK_START = 'hook_start',
    HOOK_END = 'hook_end',
    ROOT_SUITE_START = 'root_suite_start',
    ROOT_SUITE_END = 'root_suite_end',
    ROOT_SUITE_DELAY_START = 'root_suite_delay_start',
    ROOT_SUITE_DELAY_END = 'root_suite_delay_end',
    SUITE_START = 'suite_start',
    SUITE_END = 'suite_end',
    TEST_START = 'test_start',
    TEST_END = 'test_end',
    TEST_PASS = 'test_pass',
    TEST_FAIL = 'test_fail',
    TEST_PENDING = 'test_pending',
    TEST_RETRY = 'test_retry',
    RUNNER_INITIALISED = 'runner_initialised',
    RUNNER_START = 'runner_start',
    RUNNER_STOP = 'runner_stopp',
}

interface VoCEvent {
    timestamp: Date
    type: VoCEventType
}

export class VoCReporter {
    ftrConfig: FTRConfig
    lifecycle: Lifecycle
    runner: Runner
    output: WriteStream

    constructor(ftrConfig: FTRConfig, lifecycle: Lifecycle, runner: Runner, output: WriteStream) {
        this.ftrConfig = ftrConfig
        this.lifecycle = lifecycle
        this.runner = runner
        this.output = output
    }

    get functionalTestGroupType(): string {
        return process.env.TEST_GROUP_TYPE_FUNCTIONAL || 'unknown'
    }

    addEvent<T extends VoCEvent>(event: T) {
        this.output.write(`${JSON.stringify(event)}\n`)
    }

    onHookStart(hook: Runnable) {
        /**
         * Hook execution began
         */
        this.addEvent({
            timestamp: new Date(),
            type: VoCEventType.HOOK_START,
            hook: hook
        })
    }

    onHookEnd(hook: Runnable) {
        /**
         * Hook execution ended
         */
        this.addEvent({
            timestamp: new Date(),
            type: VoCEventType.HOOK_END,
            hook: hook
        })
    }

    onRunStart() {
        /**
         * Root suite execution began (all files have been parsed and hooks/tests are ready for execution)
         */
        this.addEvent({
            timestamp: new Date(),
            type: VoCEventType.ROOT_SUITE_START,
        })
    }

    onRunEnd() {
        /**
         * Root suite execution has ended
         */
        this.addEvent({
            timestamp: new Date(),
            type: VoCEventType.ROOT_SUITE_END,
        })
    }

    onDelayStart(rootSuite: Suite) {
        /**
         * Root suite execution delay has started
         */
        this.addEvent({
            timestamp: new Date(),
            type: VoCEventType.ROOT_SUITE_DELAY_START,
            suite: rootSuite
        })
    }

    onDelayEnd(rootSuite: Suite) {
        /**
         * Root suite execution delay has ended
         */
        this.addEvent({
            timestamp: new Date(),
            type: VoCEventType.ROOT_SUITE_DELAY_END,
            suite: rootSuite
        })
    }

    onSuiteStart(suite: Suite) {
        /**
         * Suite execution has started
         */
        this.addEvent({
            timestamp: new Date(),
            type: VoCEventType.SUITE_START,
            suite: suite
        })
    }

    onSuiteEnd(suite: Suite) {
        /**
         * Suite execution has ended
         */
        this.addEvent({
            timestamp: new Date(),
            type: VoCEventType.SUITE_END,
            suite: suite
        })
    }

    onTestStart(test: Test) {
        /**
         * Test execution started
         */
        this.addEvent({
            timestamp: new Date(),
            type: VoCEventType.TEST_START,
            test: test
        })
    }

    onTestEnd(test: Test) {
        /**
         * Test execution ended
         */
        this.addEvent({
            timestamp: new Date(),
            type: VoCEventType.TEST_END,
            test: test
        })
    }

    onTestPass(test: Test) {
        /**
         * Test execution finished without any errors
         */
        this.addEvent({
            timestamp: new Date(),
            type: VoCEventType.TEST_PASS,
            test: test
        })
    }

    onTestFail(test: Runnable, error: Error) {
        /**
         * Test execution failed
         */
        this.addEvent({
            timestamp: new Date(),
            type: VoCEventType.TEST_FAIL,
            test: test,
            error: error
        })
    }

    onTestPending(test: Test) {
        /**
         * Test execution is scheduled
         */
        this.addEvent({
            timestamp: new Date(),
            type: VoCEventType.TEST_PENDING,
            test: test
        })
    }

    onTestRetry(test: Test, error: Error) {
        /**
         * Test execution failed and and another attempt will be made
         */
        this.addEvent({
            timestamp: new Date(),
            type: VoCEventType.TEST_RETRY,
            test: test,
            error: error
        })
    }

    onRunnerIdle() {
        /**
         * Runner was initialised
         */
        this.addEvent({
            timestamp: new Date(),
            type: VoCEventType.RUNNER_INITIALISED
        })
    }

    onRunnerStart() {
        /**
         * Runner has started
         */
        this.addEvent({
            timestamp: new Date(),
            type: VoCEventType.RUNNER_START
        })
    }

    onRunnerStop() {
        /**
         * Runner has stopped
         */
        this.addEvent({
            timestamp: new Date(),
            type: VoCEventType.RUNNER_STOP
        })
    }
}

export function setupVoCReporter(ftrConfig: FTRConfig, lifecycle: Lifecycle, runner: Runner, outputFile: PathLike) {
    // Open the output file for reading and appending in synchronous mode.
    // The file is created if it does not exist.
    const output = createWriteStream(outputFile, { flags: 'as+' })

    // Close the output stream when the run has finished
    runner.on('stopped', () => {
        output.end()
    })
    
    // Initialise the reporter
    const reporter = new VoCReporter(ftrConfig, lifecycle, runner, output)

    // Register event listeners
    for (const [eventName, listener] of Object.entries({
        'hook': reporter.onHookStart,
        'hook end': reporter.onHookEnd,
        'start': reporter.onRunStart,
        'waiting': reporter.onDelayStart,
        'ready': reporter.onDelayEnd,
        'end': reporter.onRunEnd,
        'suite': reporter.onSuiteStart,
        'suite end': reporter.onSuiteEnd,
        'test': reporter.onTestStart,
        'test end': reporter.onTestEnd,
        'pass': reporter.onTestPass,
        'fail': reporter.onTestFail,
        'pending': reporter.onTestPending,
        'retry': reporter.onTestRetry,
        'idle': reporter.onRunnerIdle,
        'running': reporter.onRunnerStart,
        'stopped': reporter.onRunnerStop
    })) {
        runner.on(eventName, listener)
    }
}