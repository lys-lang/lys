# Test

**THIS TEST IS SKIPPED**

This tests an emergent pattern, it is a C enum-like pattern but stricter.

It is compatible with C-enums.

This may lead to future sugar syntax and code generators.

#### lib/processsignal.lys

```lys
type ProcessSignal = %stack { lowLevelType="i32" byteSize=1 }

/** Signal condition. */
impl ProcessSignal {
  private fun apply(value: i32): ProcessSignal = %wasm { (get_local $value) }

  // implicit cast to i32 is allowed
  fun as(self: ProcessSignal): i32 = %wasm { (get_local $self) }

  // implicit cast to boolean is allowed
  fun as(self: ProcessSignal): boolean =
    %wasm { (i32.ne (i32.const 0) (get_local $self)) }

  fun ==(lhs: ProcessSignal, rhs: ProcessSignal): boolean =
    %wasm { (i32.eq (get_local $lhs) (get_local $rhs)) }

  fun !=(lhs: ProcessSignal, rhs: ProcessSignal): boolean =
    %wasm { (i32.ne (get_local $lhs) (get_local $rhs)) }

  /** Hangup. */
  val HUP = ProcessSignal(1)

  /** Terminate interrupt signal. */
  val INT = ProcessSignal(2)

  /** Terminal quit signal. */
  val QUIT = ProcessSignal(3)

  /** Illegal instruction. */
  val ILL = ProcessSignal(4)

  /** Trace/breakpoint trap. */
  val TRAP = ProcessSignal(5)

  /** Process abort signal. */
  val ABRT = ProcessSignal(6)

  /** Access to an undefined portion of a memory object. */
  val BUS = ProcessSignal(7)

  /** Erroneous arithmetic operation. */
  val FPE = ProcessSignal(8)

  /** Kill. */
  val KILL = ProcessSignal(9)

  /** User-defined signal 1. */
  val USR1 = ProcessSignal(10)

  /** Invalid memory reference. */
  val SEGV = ProcessSignal(11)

  /** User-defined signal 2. */
  val USR2 = ProcessSignal(12)

  /** Write on a pipe with no one to read it. */
  val PIPE = ProcessSignal(13)

  /** Alarm clock. */
  val ALRM = ProcessSignal(14)

  /** Termination signal. */
  val TERM = ProcessSignal(15)

  /** Child process terminated, stopped, or continued. */
  val CHLD = ProcessSignal(16)

  /** Continue executing, if stopped. */
  val CONT = ProcessSignal(17)

  /** Stop executing. */
  val STOP = ProcessSignal(18)

  /** Terminal stop signal. */
  val TSTP = ProcessSignal(19)

  /** Background process attempting read. */
  val TTIN = ProcessSignal(20)

  /** Background process attempting write. */
  val TTOU = ProcessSignal(21)

  /** High bandwidth data is available at a socket. */
  val URG = ProcessSignal(22)

  /** CPU time limit exceeded. */
  val XCPU = ProcessSignal(23)

  /** File size limit exceeded. */
  val XFSZ = ProcessSignal(24)

  /** Virtual timer expired. */
  val VTALRM = ProcessSignal(25)
  val PROF = ProcessSignal(26)
  val WINCH = ProcessSignal(27)
  val POLL = ProcessSignal(28)
  val PWR = ProcessSignal(29)

  /** Bad system call. */
  val SYS = ProcessSignal(30)
}
```

#### main.lys

```lys
import support::test
import lib::processsignal

#[export]
fun main(): void = {
  START("Test c-enum")

  verify(
    ProcessSignal.HUP == ProcessSignal.HUP,
    "check =="
  )

  verify(
    ProcessSignal.HUP != ProcessSignal.PWR,
    "check !="
  )

  mustEqual(ProcessSignal.SYS, 30, "Test implicit i32 casting")

  verify(ProcessSignal.HUP, "check implicit boolean casting")

  END()
}
```
