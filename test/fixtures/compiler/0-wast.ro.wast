(module
  (memory 0 1)
  (global $system::memory::AL_BITS (mut i32) (i32.const 0))
  (global $system::memory::AL_SIZE (mut i32) (i32.const 0))
  (global $system::memory::AL_MASK (mut i32) (i32.const 0))
  (global $system::memory::MAX_SIZE_32 (mut i32) (i32.const 0))
  (global $system::memory::HEAP_BASE (mut i32) (i32.const 0))
  (global $system::memory::startOffset (mut i32) (i32.const 0))
  (global $system::memory::offset (mut i32) (i32.const 0))
  (global $system::memory::lastPtr (mut i32) (i32.const 0))
  (func $system::memory::growMemory (param $pages i32) (result i32)
    (grow_memory (get_local $pages))
  )
  (func $system::memory::currentMemory (result i32)
    (current_memory)
  )
  (func $system::memory::max (param $a i32) (param $b i32) (result i32)
    (if $a_wild_if (result i32) (call $system::core::> (get_local $a) (get_local $b))
      (then
        (get_local $a)
      )
      (else
        (get_local $b)
      )
    )
  )
  (func $system::memory::malloc (param $size i32) (result i32)
    (local $ptr i32)
    (local $newPtr i32)
    (local $pagesBefore i32)
    (local $pagesNeeded i32)
    (local $pagesWanted i32)
    (block $unknown_block_36 (result i32)
      (if $a_wild_if (result i32) (call $system::core::> (get_local $size) (i32.const 0))
          (then
            (block $unknown_block_37 (result i32)
                (if $a_wild_if (call $system::core::> (get_local $size) (get_global $system::memory::MAX_SIZE_32))
                    (then
                      (block $unknown_block_38
                          (call $system::core::panic_1)
                        )
                    )
                    (else)
                  )
                (set_local $ptr (get_global $system::memory::offset))
                (set_local $newPtr (call $system::core::& (call $system::core::+ (call $system::core::+ (get_local $ptr) (get_local $size)) (get_global $system::memory::AL_MASK)) (call $system::core::~ (get_global $system::memory::AL_MASK))))
                (set_local $pagesBefore (call $system::memory::currentMemory))
                (if $a_wild_if (call $system::core::> (get_local $newPtr) (call $system::core::<< (get_local $pagesBefore) (i32.const 16)))
                    (then
                      (block $unknown_block_39
                          (set_local $pagesNeeded (call $system::core::>>> (call $system::core::& (call $system::core::+ (call $system::core::- (get_local $newPtr) (get_local $ptr)) (i32.const 65535)) (call $system::core::~ (i32.const 65535))) (i32.const 16)))
                          (set_local $pagesWanted (call $system::memory::max (get_local $pagesBefore) (get_local $pagesNeeded)))
                          (if $a_wild_if (call $system::core::< (call $system::memory::growMemory (get_local $pagesWanted)) (i32.const 0))
                              (then
                                (block $unknown_block_40
                                    (if $a_wild_if (call $system::core::< (call $system::memory::growMemory (get_local $pagesNeeded)) (i32.const 0))
                                        (then
                                          (block $unknown_block_41
                                              (call $system::core::panic_1)
                                            )
                                        )
                                        (else)
                                      )
                                  )
                              )
                              (else)
                            )
                        )
                    )
                    (else)
                  )
                (set_global $system::memory::offset (get_local $newPtr))
                (get_local $ptr)
              )
          )
          (else
            (block $unknown_block_42 (result i32)
                (i32.const 0)
              )
          )
        )
    )
  )
  (func $system::memory::memcpy (param $from i32) (param $to i32) (param $len i32)
    (local $end i32)
    (set_local $end (i32.add (get_local $from) (get_local $len)))
    (block $exit (loop $cont (br_if $exit (i32.eq (get_local $from) (get_local $end))) (i32.store8 (get_local $to) (i32.load8_u (get_local $from))) (set_local $from (i32.add (get_local $from) (i32.const 1))) (set_local $to (i32.add (get_local $to) (i32.const 1))) (br $cont)))
  )
  (func $system::memory::memset (param $ptr i32) (param $content i32) (param $len i32)
    (local $end i32)
    (set_local $end (i32.add (get_local $ptr) (get_local $len)))
    (block $exit (loop $cont (br_if $exit (i32.eq (get_local $ptr) (get_local $end))) (i32.store8 (get_local $ptr) (i32.load8_u (get_local $content))) (set_local $ptr (i32.add (get_local $ptr) (i32.const 1))) (br $cont)))
  )
  (func $system::core::assert (param $x i32)
    (if $a_wild_if (call $system::core::==_33 (get_local $x) (i32.const 0))
      (then
        (call $system::core::panic_1)
      )
      (else)
    )
  )
  (func $system::core::addressFromRef (param $pointer i64) (result i32)
    (i32.wrap/i64 (get_local $pointer))
  )
  (func $system::core::panic_1
    (unreachable)
  )
  (func $system::core::sizeOf (param $lhs i32) (result i32)
    (i32.const 1)
  )
  (func $system::core::as (param $lhs i32) (result i32)
    (get_local $lhs)
  )
  (func $system::core::as_1 (param $lhs i32) (result i32)
    (get_local $lhs)
  )
  (func $system::core::as_2 (param $lhs i32) (result i32)
    (get_local $lhs)
  )
  (func $system::core::as_3 (param $lhs i32) (result i32)
    (get_local $lhs)
  )
  (func $system::core::as_4 (param $lhs i32) (result i64)
    (i64.extend_u/i32 (get_local $lhs))
  )
  (func $system::core::as_5 (param $lhs i32) (result i64)
    (i64.extend_s/i32 (get_local $lhs))
  )
  (func $system::core::as_6 (param $lhs i32) (result f32)
    (f32.convert_u/i32 (get_local $lhs))
  )
  (func $system::core::as_7 (param $lhs i32) (result f64)
    (f64.convert_u/i32 (get_local $lhs))
  )
  (func $system::core::==_1 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_2 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_3 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::store (param $lhs i64) (param $rhs i32)
    (i32.store8 (call $system::core::addressFromRef (get_local $lhs)) (get_local $rhs))
  )
  (func $system::core::store_1 (param $lhs i64) (param $rhs i32) (param $offset i32)
    (i32.store8 (i32.add (get_local $offset) (call $system::core::addressFromRef (get_local $lhs))) (get_local $rhs))
  )
  (func $system::core::load (param $lhs i64) (result i32)
    (i32.load8_u (call $system::core::addressFromRef (get_local $lhs)))
  )
  (func $system::core::load_1 (param $lhs i64) (param $offset i32) (result i32)
    (i32.load8_u (i32.add (get_local $offset) (call $system::core::addressFromRef (get_local $lhs))))
  )
  (func $system::core::sizeOf_2 (param $lhs i32) (result i32)
    (i32.const 2)
  )
  (func $system::core::as_9 (param $lhs i32) (result i32)
    (get_local $lhs)
  )
  (func $system::core::as_10 (param $lhs i32) (result i64)
    (i64.extend_s/i32 (get_local $lhs))
  )
  (func $system::core::as_11 (param $lhs i32) (result f32)
    (f32.convert_s/i32 (get_local $lhs))
  )
  (func $system::core::as_12 (param $lhs i32) (result f64)
    (f64.convert_s/i32 (get_local $lhs))
  )
  (func $system::core::==_5 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_6 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::store_3 (param $lhs i64) (param $rhs i32)
    (i32.store16 (call $system::core::addressFromRef (get_local $lhs)) (get_local $rhs))
  )
  (func $system::core::sizeOf_4 (param $lhs i32) (result i32)
    (i32.const 2)
  )
  (func $system::core::as_14 (param $lhs i32) (result i32)
    (get_local $lhs)
  )
  (func $system::core::as_15 (param $lhs i32) (result i32)
    (get_local $lhs)
  )
  (func $system::core::as_16 (param $lhs i32) (result i64)
    (i64.extend_u/i32 (get_local $lhs))
  )
  (func $system::core::as_17 (param $lhs i32) (result i64)
    (i64.extend_u/i32 (get_local $lhs))
  )
  (func $system::core::as_18 (param $lhs i32) (result f32)
    (f32.convert_u/i32 (get_local $lhs))
  )
  (func $system::core::as_19 (param $lhs i32) (result f64)
    (f64.convert_u/i32 (get_local $lhs))
  )
  (func $system::core::==_8 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_9 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_10 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::store_5 (param $lhs i64) (param $rhs i32)
    (i32.store16 (call $system::core::addressFromRef (get_local $lhs)) (get_local $rhs))
  )
  (func $system::core::sizeOf_6 (param $lhs i32) (result i32)
    (i32.const 4)
  )
  (func $system::core::as_21 (param $lhs i32) (result i64)
    (i64.extend_s/i32 (get_local $lhs))
  )
  (func $system::core::as_22 (param $lhs i32) (result f32)
    (f32.convert_s/i32 (get_local $lhs))
  )
  (func $system::core::as_23 (param $lhs i32) (result f64)
    (f64.convert_s/i32 (get_local $lhs))
  )
  (func $system::core::as_24 (param $lhs i32) (result f32)
    (f32.convert_s/i32 (get_local $lhs))
  )
  (func $system::core::==_12 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_13 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_14 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::!= (param $lhs i32) (param $rhs i32) (result i32)
    (i32.ne (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::& (param $lhs i32) (param $rhs i32) (result i32)
    (i32.and (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::| (param $lhs i32) (param $rhs i32) (result i32)
    (i32.or (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::^ (param $lhs i32) (param $rhs i32) (result i32)
    (i32.xor (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::^_1 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.xor (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::+ (param $lhs i32) (param $rhs i32) (result i32)
    (i32.add (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::- (param $lhs i32) (param $rhs i32) (result i32)
    (i32.sub (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::-_1 (param $rhs i32) (result i32)
    (i32.sub (i32.const 0) (get_local $rhs))
  )
  (func $system::core::* (param $lhs i32) (param $rhs i32) (result i32)
    (i32.mul (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::/ (param $lhs i32) (param $rhs i32) (result i32)
    (i32.div_s (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::~ (param $rhs i32) (result i32)
    (i32.xor (i32.const 0xFFFFFFFF) (get_local $rhs))
  )
  (func $system::core::>>> (param $lhs i32) (param $rhs i32) (result i32)
    (i32.shr_u (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::>> (param $lhs i32) (param $rhs i32) (result i32)
    (i32.shr_s (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::<< (param $lhs i32) (param $rhs i32) (result i32)
    (i32.shl (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::>= (param $lhs i32) (param $rhs i32) (result i32)
    (i32.ge_s (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::<= (param $lhs i32) (param $rhs i32) (result i32)
    (i32.le_s (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::> (param $lhs i32) (param $rhs i32) (result i32)
    (i32.gt_s (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::< (param $lhs i32) (param $rhs i32) (result i32)
    (i32.lt_s (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::store_7 (param $lhs i64) (param $rhs i32)
    (i32.store (call $system::core::addressFromRef (get_local $lhs)) (get_local $rhs))
  )
  (func $system::core::store_8 (param $lhs i64) (param $rhs i32) (param $offset i32)
    (i32.store (i32.add (get_local $offset) (call $system::core::addressFromRef (get_local $lhs))) (get_local $rhs))
  )
  (func $system::core::load_3 (param $lhs i64) (result i32)
    (i32.load (call $system::core::addressFromRef (get_local $lhs)))
  )
  (func $system::core::load_4 (param $lhs i64) (param $offset i32) (result i32)
    (i32.load (i32.add (get_local $offset) (call $system::core::addressFromRef (get_local $lhs))))
  )
  (func $system::core::sizeOf_8 (param $lhs i32) (result i32)
    (i32.const 4)
  )
  (func $system::core::as_26 (param $lhs i32) (result i64)
    (i64.extend_u/i32 (get_local $lhs))
  )
  (func $system::core::as_27 (param $lhs i32) (result i64)
    (i64.extend_u/i32 (get_local $lhs))
  )
  (func $system::core::as_28 (param $lhs i32) (result f32)
    (f32.convert_u/i32 (get_local $lhs))
  )
  (func $system::core::as_29 (param $lhs i32) (result f64)
    (f64.convert_u/i32 (get_local $lhs))
  )
  (func $system::core::as_30 (param $lhs i32) (result i64)
    (i64.extend_s/i32 (get_local $lhs))
  )
  (func $system::core::as_31 (param $lhs i32) (result f32)
    (f32.convert_u/i32 (get_local $lhs))
  )
  (func $system::core::==_16 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_17 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_18 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::!=_2 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.ne (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::+_2 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.add (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::-_3 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.sub (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::*_2 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.mul (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::/_2 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.div_u (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::~_2 (param $rhs i32) (result i32)
    (i32.xor (i32.const 0xFFFFFFFF) (get_local $rhs))
  )
  (func $system::core::>>>_2 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.shr_u (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::>>_2 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.shr_s (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::<<_2 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.shl (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::^_3 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.xor (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::>=_2 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.ge_u (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::<=_2 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.le_u (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::>_2 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.gt_u (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::<_2 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.lt_u (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::store_10 (param $lhs i64) (param $rhs i32)
    (i32.store (call $system::core::addressFromRef (get_local $lhs)) (get_local $rhs))
  )
  (func $system::core::sizeOf_10 (param $lhs i64) (result i32)
    (i32.const 8)
  )
  (func $system::core::as_33 (param $lhs i64) (result f32)
    (f32.convert_s/i64 (get_local $lhs))
  )
  (func $system::core::as_34 (param $lhs i64) (result f64)
    (f64.convert_s/i64 (get_local $lhs))
  )
  (func $system::core::as_35 (param $lhs i64) (result f32)
    (f32.convert_s/i64 (get_local $lhs))
  )
  (func $system::core::as_36 (param $lhs i64) (result i32)
    (i32.wrap/i64 (get_local $lhs))
  )
  (func $system::core::==_20 (param $lhs i64) (param $rhs i64) (result i32)
    (i64.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_21 (param $lhs i64) (param $rhs i32) (result i32)
    (i64.eq (get_local $lhs) (i64.extend_s/i32 (get_local $rhs)))
  )
  (func $system::core::==_22 (param $lhs i64) (param $rhs i32) (result i32)
    (i64.eq (get_local $lhs) (i64.extend_s/i32 (get_local $rhs)))
  )
  (func $system::core::!=_4 (param $lhs i64) (param $rhs i64) (result i32)
    (i64.ne (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::+_4 (param $lhs i64) (param $rhs i64) (result i64)
    (i64.add (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::-_5 (param $lhs i64) (param $rhs i64) (result i64)
    (i64.sub (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::*_4 (param $lhs i64) (param $rhs i64) (result i64)
    (i64.mul (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::/_4 (param $lhs i64) (param $rhs i64) (result i64)
    (i64.div_s (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::~_4 (param $rhs i64) (result i64)
    (i64.xor (i64.const 0xFFFFFFFFFFFFFFFF) (get_local $rhs))
  )
  (func $system::core::>>>_4 (param $lhs i64) (param $rhs i64) (result i64)
    (i64.shr_u (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::>>_4 (param $lhs i64) (param $rhs i64) (result i64)
    (i64.shr_s (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::<<_4 (param $lhs i64) (param $rhs i64) (result i64)
    (i64.shl (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::^_5 (param $lhs i64) (param $rhs i64) (result i64)
    (i64.xor (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::>=_4 (param $lhs i64) (param $rhs i64) (result i32)
    (i64.ge_s (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::<=_4 (param $lhs i64) (param $rhs i64) (result i32)
    (i64.le_s (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::>_4 (param $lhs i64) (param $rhs i64) (result i32)
    (i64.gt_s (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::<_4 (param $lhs i64) (param $rhs i64) (result i32)
    (i64.lt_s (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::sizeOf_12 (param $lhs i64) (result i32)
    (i32.const 8)
  )
  (func $system::core::as_38 (param $lhs i64) (result f32)
    (f32.convert_u/i64 (get_local $lhs))
  )
  (func $system::core::as_39 (param $lhs i64) (result f64)
    (f64.convert_u/i64 (get_local $lhs))
  )
  (func $system::core::as_40 (param $lhs i64) (result f32)
    (f32.convert_u/i64 (get_local $lhs))
  )
  (func $system::core::as_41 (param $lhs i64) (result i32)
    (i32.wrap/i64 (get_local $lhs))
  )
  (func $system::core::==_24 (param $lhs i64) (param $rhs i64) (result i32)
    (i64.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_25 (param $lhs i64) (param $rhs i32) (result i32)
    (i64.eq (get_local $lhs) (i64.extend_u/i32 (get_local $rhs)))
  )
  (func $system::core::==_26 (param $lhs i64) (param $rhs i32) (result i32)
    (i64.eq (get_local $lhs) (i64.extend_u/i32 (get_local $rhs)))
  )
  (func $system::core::==_27 (param $lhs i64) (param $rhs i32) (result i32)
    (i64.eq (get_local $lhs) (i64.extend_u/i32 (get_local $rhs)))
  )
  (func $system::core::!=_6 (param $lhs i64) (param $rhs i64) (result i32)
    (i64.ne (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::+_6 (param $lhs i64) (param $rhs i64) (result i64)
    (i64.add (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::-_7 (param $lhs i64) (param $rhs i64) (result i64)
    (i64.sub (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::*_6 (param $lhs i64) (param $rhs i64) (result i64)
    (i64.mul (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::/_6 (param $lhs i64) (param $rhs i64) (result i64)
    (i64.div_u (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::~_6 (param $rhs i64) (result i64)
    (i64.xor (i64.const 0xFFFFFFFFFFFFFFFF) (get_local $rhs))
  )
  (func $system::core::>>>_6 (param $lhs i64) (param $rhs i64) (result i64)
    (i64.shr_u (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::>>_6 (param $lhs i64) (param $rhs i64) (result i64)
    (i64.shr_s (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::<<_6 (param $lhs i64) (param $rhs i64) (result i64)
    (i64.shl (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::^_7 (param $lhs i64) (param $rhs i64) (result i64)
    (i64.xor (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::>=_6 (param $lhs i64) (param $rhs i64) (result i32)
    (i64.ge_u (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::<=_6 (param $lhs i64) (param $rhs i64) (result i32)
    (i64.le_u (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::>_6 (param $lhs i64) (param $rhs i64) (result i32)
    (i64.gt_u (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::<_6 (param $lhs i64) (param $rhs i64) (result i32)
    (i64.lt_u (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::sizeOf_14 (param $lhs f32) (result i32)
    (i32.const 4)
  )
  (func $system::core::as_43 (param $lhs f32) (result f64)
    (f64.promote/f32 (get_local $lhs))
  )
  (func $system::core::as_44 (param $lhs f32) (result i64)
    (i64.trunc_s/f32 (get_local $lhs))
  )
  (func $system::core::as_45 (param $lhs f32) (result i64)
    (i64.trunc_u/f32 (get_local $lhs))
  )
  (func $system::core::as_46 (param $lhs f32) (result i32)
    (i32.trunc_s/f32 (get_local $lhs))
  )
  (func $system::core::as_47 (param $lhs f32) (result i32)
    (i32.trunc_u/f32 (get_local $lhs))
  )
  (func $system::core::+_8 (param $lhs f32) (param $rhs f32) (result f32)
    (f32.add (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::-_9 (param $lhs f32) (param $rhs f32) (result f32)
    (f32.sub (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::*_8 (param $lhs f32) (param $rhs f32) (result f32)
    (f32.mul (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::/_8 (param $lhs f32) (param $rhs f32) (result f32)
    (f32.div (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_29 (param $lhs f32) (param $rhs f32) (result i32)
    (f32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::>=_8 (param $lhs f32) (param $rhs f32) (result i32)
    (f32.ge (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::<=_8 (param $lhs f32) (param $rhs f32) (result i32)
    (f32.le (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::>_8 (param $lhs f32) (param $rhs f32) (result i32)
    (f32.gt (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::<_8 (param $lhs f32) (param $rhs f32) (result i32)
    (f32.lt (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::!=_8 (param $lhs f32) (param $rhs f32) (result i32)
    (f32.ne (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::store_12 (param $lhs i64) (param $rhs f32)
    (f32.store (call $system::core::addressFromRef (get_local $lhs)) (get_local $rhs))
  )
  (func $system::core::sizeOf_16 (param $lhs f64) (result i32)
    (i32.const 8)
  )
  (func $system::core::+_10 (param $lhs f64) (param $rhs f64) (result f64)
    (f64.add (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::-_11 (param $lhs f64) (param $rhs f64) (result f64)
    (f64.sub (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::*_10 (param $lhs f64) (param $rhs f64) (result f64)
    (f64.mul (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::/_10 (param $lhs f64) (param $rhs f64) (result f64)
    (f64.div (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_31 (param $lhs f64) (param $rhs f64) (result i32)
    (f64.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::>=_10 (param $lhs f64) (param $rhs f64) (result i32)
    (f64.ge (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::<=_10 (param $lhs f64) (param $rhs f64) (result i32)
    (f64.le (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::>_10 (param $lhs f64) (param $rhs f64) (result i32)
    (f64.gt (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::<_10 (param $lhs f64) (param $rhs f64) (result i32)
    (f64.lt (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::!=_10 (param $lhs f64) (param $rhs f64) (result i32)
    (f64.ne (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::as_49 (param $lhs f64) (result f32)
    (f32.demote/f64 (get_local $lhs))
  )
  (func $system::core::as_50 (param $lhs f64) (result i64)
    (i64.trunc_s/f64 (get_local $lhs))
  )
  (func $system::core::as_51 (param $lhs f64) (result i64)
    (i64.trunc_u/f64 (get_local $lhs))
  )
  (func $system::core::as_52 (param $lhs f64) (result i32)
    (i32.trunc_s/f64 (get_local $lhs))
  )
  (func $system::core::as_53 (param $lhs f64) (result i32)
    (i32.trunc_u/f64 (get_local $lhs))
  )
  (func $system::core::store_14 (param $lhs i64) (param $rhs f64)
    (f64.store (call $system::core::addressFromRef (get_local $lhs)) (get_local $rhs))
  )
  (func $system::core::sizeOf_18 (param $lhs i32) (result i32)
    (i32.const 4)
  )
  (func $system::core::&& (param $lhs i32) (param $rhs i32) (result i32)
    (i32.and (i32.ne (get_local $lhs) (i32.const 0)) (i32.ne (get_local $rhs) (i32.const 0)))
  )
  (func $system::core::==_33 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (i32.eqz (get_local $lhs)) (i32.eqz (get_local $rhs)))
  )
  (func $system::core::|| (param $lhs i32) (param $rhs i32) (result i32)
    (i32.or (i32.ne (get_local $lhs) (i32.const 0)) (i32.ne (get_local $rhs) (i32.const 0)))
  )
  (func $system::core::! (param $rhs i32) (result i32)
    (if $a_wild_if (result i32) (get_local $rhs)
      (then
        (i32.const 0)
      )
      (else
        (i32.const 1)
      )
    )
  )
  (func $system::core::sizeOf_20 (param $lhs i32) (result i32)
    (i32.const 4)
  )
  (func $system::core::as_55 (param $lhs i32) (result i32)
    (get_local $lhs)
  )
  (func $system::core::as_56 (param $lhs i32) (result i32)
    (get_local $lhs)
  )
  (func $system::core::as_57 (param $lhs i32) (result i32)
    (get_local $lhs)
  )
  (func $system::core::as_58 (param $lhs i32) (result i64)
    (i64.extend_u/i32 (get_local $lhs))
  )
  (func $system::core::as_59 (param $lhs i32) (result i64)
    (i64.extend_s/i32 (get_local $lhs))
  )
  (func $system::core::as_60 (param $lhs i32) (result f32)
    (f32.convert_u/i32 (get_local $lhs))
  )
  (func $system::core::as_61 (param $lhs i32) (result f64)
    (f64.convert_u/i32 (get_local $lhs))
  )
  (func $system::core::sizeOf_22 (param $lhs i32) (result i32)
    (i32.const 4)
  )
  (func $system::core::sizeOf_24 (param $lhs i32) (result i32)
    (i32.const 4)
  )
  (func $system::core::is (param $lhs i64) (result i32)
    (i32.const 1)
  )
  (func $system::core::==_35 (param $lhs i64) (param $rhs i64) (result i32)
    (i64.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::sizeOf_26 (param $lhs i64) (result i32)
    (i32.const 8)
  )
  (export "main" (func $test/fixtures/compiler/0-wast.ro::main))
  (func $test/fixtures/compiler/0-wast.ro::xx
    (block $unknown_block_1
      (nop)
    )
  )
  (func $test/fixtures/compiler/0-wast.ro::add (param $a i32) (param $b i32) (result i32)
    (local $t i32)
    (set_local $t (i32.const 3))
    (call $test/fixtures/compiler/0-wast.ro::xx)
    (drop (call $system::memory::malloc (i32.const 1)))
    (i32.mul (i32.add (get_local $a) (get_local $b)) (get_local $t))
  )
  (func $test/fixtures/compiler/0-wast.ro::main (result i32)
    (call $test/fixtures/compiler/0-wast.ro::add (i32.const 1) (i32.const 2))
  )
  (func $%%START%%
    (set_global $system::memory::AL_BITS (i32.const 3))
    (set_global $system::memory::AL_SIZE (call $system::core::<< (i32.const 1) (get_global $system::memory::AL_BITS)))
    (set_global $system::memory::AL_MASK (call $system::core::- (get_global $system::memory::AL_SIZE) (i32.const 1)))
    (set_global $system::memory::MAX_SIZE_32 (call $system::core::<< (i32.const 1) (i32.const 30)))
    (set_global $system::memory::HEAP_BASE (i32.const 0))
    (set_global $system::memory::startOffset (call $system::core::& (call $system::core::+ (get_global $system::memory::HEAP_BASE) (get_global $system::memory::AL_MASK)) (call $system::core::~ (get_global $system::memory::AL_MASK))))
    (set_global $system::memory::offset (get_global $system::memory::startOffset))
    (set_global $system::memory::lastPtr (i32.const 0))
  )
  (start $%%START%%)
)
