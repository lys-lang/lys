(module
  (memory 0 1)
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
  (func $system::core::== (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_1 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_2 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
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
  (func $system::core::==_4 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_5 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
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
  (func $system::core::==_7 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_8 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_9 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
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
  (func $system::core::==_11 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_12 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_13 (param $lhs i32) (param $rhs i32) (result i32)
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
  (func $system::core::==_15 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_16 (param $lhs i32) (param $rhs i32) (result i32)
    (i32.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_17 (param $lhs i32) (param $rhs i32) (result i32)
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
  (func $system::core::==_19 (param $lhs i64) (param $rhs i64) (result i32)
    (i64.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_20 (param $lhs i64) (param $rhs i32) (result i32)
    (i64.eq (get_local $lhs) (i64.extend_s/i32 (get_local $rhs)))
  )
  (func $system::core::==_21 (param $lhs i64) (param $rhs i32) (result i32)
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
  (func $system::core::==_23 (param $lhs i64) (param $rhs i64) (result i32)
    (i64.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::==_24 (param $lhs i64) (param $rhs i32) (result i32)
    (i64.eq (get_local $lhs) (i64.extend_u/i32 (get_local $rhs)))
  )
  (func $system::core::==_25 (param $lhs i64) (param $rhs i32) (result i32)
    (i64.eq (get_local $lhs) (i64.extend_u/i32 (get_local $rhs)))
  )
  (func $system::core::==_26 (param $lhs i64) (param $rhs i32) (result i32)
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
  (func $system::core::==_28 (param $lhs f32) (param $rhs f32) (result i32)
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
  (func $system::core::==_30 (param $lhs f64) (param $rhs f64) (result i32)
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
  (func $system::core::sizeOf_18 (param $lhs i32) (result i32)
    (i32.const 4)
  )
  (func $system::core::&& (param $lhs i32) (param $rhs i32) (result i32)
    (i32.and (i32.ne (get_local $lhs) (i32.const 0)) (i32.ne (get_local $rhs) (i32.const 0)))
  )
  (func $system::core::==_32 (param $lhs i32) (param $rhs i32) (result i32)
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
  (func $system::core::==_34 (param $lhs i64) (param $rhs i64) (result i32)
    (i64.eq (get_local $lhs) (get_local $rhs))
  )
  (func $system::core::sizeOf_26 (param $lhs i64) (result i32)
    (i32.const 8)
  )
  (func $system::core::assert (param $x i32)
    (if $a_wild_if (call $system::core::==_32 (get_local $x) (i32.const 0))
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
  (func $test::fibo (param $n i32) (param $x1 i32) (param $x2 i32) (result i32)
    (if $a_wild_if (result i32) (call $system::core::> (get_local $n) (i32.const 0))
      (then
        (call $test::fibo (call $system::core::- (get_local $n) (i32.const 1)) (get_local $x2) (call $system::core::+ (get_local $x1) (get_local $x2)))
      )
      (else
        (get_local $x1)
      )
    )
  )
  (func $test::fib (param $n i32) (result i32)
    (call $test::fibo (get_local $n) (i32.const 0) (i32.const 1))
  )
  (func $test::test (result i32)
    (call $test::fib (i32.const 46))
  )
)
