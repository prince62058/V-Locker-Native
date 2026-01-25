// // SplashScreen.js
// import React, { useEffect, useRef, useMemo } from 'react';
// import { View, Text, StyleSheet, Dimensions, Animated, Easing, Platform } from 'react-native';
// import { COLORS } from '../../constants';

// const { width, height } = Dimensions.get('window');

// // Compute the scale so the circle covers the entire screen
// function computeMaxScale(baseDiameter) {
//     const rNeeded = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
//     const baseRadius = baseDiameter / 2;
//     const s = rNeeded / baseRadius;
//     return s * 1.12; // slight overscale to avoid edge artifacts
// }

// const Splash = ({ onFinish }) => {
//     // Config
//     const CIRCLE_DIAMETER = Math.min(width, height) * 0.36;
//     // Timeline (<= 3000ms total)
//     const FADE_IN = 600;
//     const GLOW_PULSE = 700; // overlaps slightly with FADE_IN end
//     const EXPAND = 1200;
//     const DISSOLVE = 400;
//     const HOLD_BEFORE_EXPAND = 150; // tiny pause for anticipation

//     // Animated values
//     const scale = useRef(new Animated.Value(0)).current;           // circle scale
//     const overlayOpacity = useRef(new Animated.Value(1)).current;  // overlay fade out
//     const logoOpacity = useRef(new Animated.Value(0)).current;     // title/logo fade in
//     const glowScale = useRef(new Animated.Value(0.9)).current;     // subtle pulse
//     const glowOpacity = useRef(new Animated.Value(0)).current;     // glow alpha

//     const targetScale = useMemo(() => computeMaxScale(CIRCLE_DIAMETER), [CIRCLE_DIAMETER]);

//     useEffect(() => {
//         let mounted = true;

//         // Logo fade-in
//         const logoFade = Animated.timing(logoOpacity, {
//             toValue: 1,
//             duration: FADE_IN,
//             easing: Easing.out(Easing.cubic),
//             useNativeDriver: true,
//         });

//         // Ambient glow pulse (fade in + scale up then down slightly)
//         const glowIn = Animated.parallel([
//             Animated.timing(glowOpacity, {
//                 toValue: 0.55,
//                 duration: Math.floor(GLOW_PULSE * 0.45),
//                 easing: Easing.out(Easing.cubic),
//                 useNativeDriver: true,
//             }),
//             Animated.timing(glowScale, {
//                 toValue: 1.05,
//                 duration: Math.floor(GLOW_PULSE * 0.6),
//                 easing: Easing.out(Easing.cubic),
//                 useNativeDriver: true,
//             }),
//         ]);

//         const glowSettle = Animated.parallel([
//             Animated.timing(glowOpacity, {
//                 toValue: 0.2,
//                 duration: Math.floor(GLOW_PULSE * 0.4),
//                 easing: Easing.inOut(Easing.quad),
//                 useNativeDriver: true,
//             }),
//             Animated.timing(glowScale, {
//                 toValue: 1.0,
//                 duration: Math.floor(GLOW_PULSE * 0.4),
//                 easing: Easing.inOut(Easing.quad),
//                 useNativeDriver: true,
//             }),
//         ]);

//         // Circle expand
//         const circleExpand = Animated.sequence([
//             Animated.delay(HOLD_BEFORE_EXPAND),
//             Animated.timing(scale, {
//                 toValue: targetScale,
//                 duration: EXPAND,
//                 easing: Easing.out(Easing.cubic),
//                 useNativeDriver: true,
//             }),
//         ]);

//         // Overlay dissolve
//         const dissolve = Animated.timing(overlayOpacity, {
//             toValue: 0,
//             duration: DISSOLVE,
//             easing: Easing.out(Easing.quad),
//             useNativeDriver: true,
//         });

//         // Run timeline with slight overlap between blocks for fluidity
//         Animated.sequence([
//             Animated.parallel([
//                 logoFade,
//                 Animated.sequence([glowIn, glowSettle]),
//             ]),
//             Animated.parallel([
//                 circleExpand,
//                 // keep glow faint during expand
//                 Animated.timing(glowOpacity, {
//                     toValue: 0.15,
//                     duration: Math.floor(EXPAND * 0.7),
//                     easing: Easing.linear,
//                     useNativeDriver: true,
//                 }),
//             ]),
//             Animated.parallel([
//                 dissolve,
//                 Animated.timing(glowOpacity, {
//                     toValue: 0,
//                     duration: DISSOLVE,
//                     easing: Easing.out(Easing.quad),
//                     useNativeDriver: true,
//                 }),
//             ]),
//         ]).start(() => {
//             if (mounted && onFinish) onFinish();
//         });

//         return () => {
//             mounted = false;
//         };
//     }, [targetScale]);

//     return (
//         <View style={styles.container}>
//             <View style={styles.content}>
//                 <Text style={[styles.name, { opacity: 1 }]}>
//                     V Locker
//                 </Text>
//                 <Animated.View
//                     pointerEvents="none"
//                     style={[
//                         styles.nameOverlay,
//                         { opacity: logoOpacity },
//                     ]}
//                 >
//                     <Text style={styles.nameHighlight}>V Locker</Text>
//                 </Animated.View>
//             </View>

//             {/* Overlay + expanding circle mask illusion */}
//             <Animated.View pointerEvents="none" style={[styles.overlay, { opacity: overlayOpacity }]}>
//                 <View style={styles.maskContainer}>
//                     {/* Ambient glow behind the circle */}
//                     <Animated.View
//                         style={[
//                             styles.glow,
//                             {
//                                 width: CIRCLE_DIAMETER * 1.25,
//                                 height: CIRCLE_DIAMETER * 1.25,
//                                 borderRadius: (CIRCLE_DIAMETER * 1.25) / 2,
//                                 transform: [{ scale: glowScale }],
//                                 opacity: glowOpacity,
//                             },
//                         ]}
//                     />

//                     {/* Expanding circle */}
//                     <Animated.View
//                         style={[
//                             styles.circle,
//                             {
//                                 width: CIRCLE_DIAMETER,
//                                 height: CIRCLE_DIAMETER,
//                                 borderRadius: CIRCLE_DIAMETER / 2,
//                                 transform: [{ scale }],
//                             },
//                         ]}
//                     />
//                 </View>
//             </Animated.View>
//         </View>
//     );
// };

// export default Splash;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#0d0f14',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     content: {
//         position: 'absolute',
//         top: 0, bottom: 0, left: 0, right: 0,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     name: {
//         color: '#FFFFFF',
//         fontSize: 40,
//         fontWeight: '700',
//         letterSpacing: 1.2,
//         // subtle static shadow for readability
//         textShadowColor: 'rgba(0,0,0,0.35)',
//         textShadowOffset: { width: 0, height: 2 },
//         textShadowRadius: 6,
//     },
//     nameOverlay: {
//         position: 'absolute',
//     },
//     nameHighlight: {
//         color: '#FFFFFF',
//         fontSize: 40,
//         fontWeight: '700',
//         letterSpacing: 1.2,
//         // high-contrast glow on fade-in
//         textShadowColor: 'rgba(62, 142, 255, 0.8)',
//         textShadowOffset: { width: 0, height: 0 },
//         textShadowRadius: 16,
//     },
//     overlay: {
//         position: 'absolute',
//         top: 0, bottom: 0, left: 0, right: 0,
//         backgroundColor: '#0d0f14',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     maskContainer: {
//         position: 'absolute',
//         width,
//         height,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     circle: {
//         backgroundColor: COLORS?.primary ?? '#3E8EFF',
//         // soft shadow to lift the circle at start (Android uses elevation fallback)
//         shadowColor: '#3E8EFF',
//         shadowOpacity: Platform.OS === 'ios' ? 0.45 : 0,
//         shadowRadius: 18,
//         shadowOffset: { width: 0, height: 6 },
//         elevation: 8,
//     },
//     glow: {
//         position: 'absolute',
//         backgroundColor: '#3E8EFF',
//         opacity: 0.25,
//         // radial-ish gradient by layering shadow + blur imitations
//         shadowColor: '#3E8EFF',
//         shadowOpacity: Platform.OS === 'ios' ? 0.9 : 0,
//         shadowRadius: 42,
//         shadowOffset: { width: 0, height: 0 },
//     },
// });

// SplashScreen.js
// import React, { useEffect, useRef, useMemo } from 'react';
// import { View, Text, StyleSheet, Dimensions, Animated, Easing, Platform } from 'react-native';
// import { LinearGradient } from 'react-native-linear-gradient'; // or react-native-linear-gradient
// import { COLORS } from '../../constants';

// const { width, height } = Dimensions.get('window');

// function computeMaxScale(baseDiameter) {
//     const rNeeded = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
//     const baseRadius = baseDiameter / 2;
//     const s = rNeeded / baseRadius;
//     return s * 1.15;
// }

// const TITLE = 'V Locker'.split('');

// const Splash = ({ onFinish }) => {
//     // Sizes
//     const BASE = Math.min(width, height);
//     const CIRCLE_DIAMETER = BASE * 0.34;
//     const RING_DIAMETER = CIRCLE_DIAMETER * 1.35;

//     // Timing (<= 3000ms total with overlaps)
//     const T_LETTERS_IN = 500;   // staggered in
//     const T_RING_ROT = 1200;    // ring rotation pass
//     const T_NUCLEUS_SPRING = 600;
//     const T_EXPAND = 1000;
//     const T_DISSOLVE = 400;
//     const T_OVERLAP_START = 200; // overlap starts between segments

//     // Animated values
//     const overlayOpacity = useRef(new Animated.Value(1)).current;  // whole overlay alpha
//     const expandScale = useRef(new Animated.Value(0)).current;     // final reveal scale
//     const ringRotate = useRef(new Animated.Value(0)).current;      // 0..1 -> 0..360deg
//     const nucleusScale = useRef(new Animated.Value(0.6)).current;  // spring pop nucleus
//     const particlesShift = useRef(new Animated.Value(0)).current;  // parallax
//     const letterOpacities = useRef(TITLE.map(() => new Animated.Value(0))).current;
//     const letterY = useRef(TITLE.map(() => new Animated.Value(8))).current;

//     const targetScale = useMemo(() => computeMaxScale(CIRCLE_DIAMETER), [CIRCLE_DIAMETER]);

//     useEffect(() => {
//         let mounted = true;

//         // 1) Letter stagger
//         const letterAnims = TITLE.map((_, i) =>
//             Animated.parallel([
//                 Animated.timing(letterOpacities[i], {
//                     toValue: 1,
//                     duration: 360,
//                     easing: Easing.out(Easing.cubic),
//                     useNativeDriver: true,
//                 }),
//                 Animated.timing(letterY[i], {
//                     toValue: 0,
//                     duration: 420,
//                     easing: Easing.out(Easing.cubic),
//                     useNativeDriver: true,
//                 }),
//             ])
//         );

//         // 2) Ring rotate + particles parallax + nucleus spring
//         const ringRotateAnim = Animated.timing(ringRotate, {
//             toValue: 1,
//             duration: T_RING_ROT,
//             easing: Easing.out(Easing.cubic),
//             useNativeDriver: true,
//         });

//         const particlesAnim = Animated.timing(particlesShift, {
//             toValue: 1,
//             duration: T_RING_ROT + 300,
//             easing: Easing.out(Easing.cubic),
//             useNativeDriver: true,
//         });

//         const nucleusPop = Animated.spring(nucleusScale, {
//             toValue: 1,
//             stiffness: 220,
//             damping: 18,
//             mass: 0.6,
//             useNativeDriver: true,
//         });

//         // 3) Reveal expand + dissolve
//         const expand = Animated.timing(expandScale, {
//             toValue: targetScale,
//             duration: T_EXPAND,
//             easing: Easing.out(Easing.cubic),
//             useNativeDriver: true,
//         });

//         const dissolve = Animated.timing(overlayOpacity, {
//             toValue: 0,
//             duration: T_DISSOLVE,
//             easing: Easing.out(Easing.quad),
//             useNativeDriver: true,
//         });

//         // Build timeline with overlaps to fit <= 3000ms
//         Animated.sequence([
//             // Letters in (500ms)
//             Animated.stagger(50, letterAnims),
//             // Overlap: start ring/nucleus/particles slightly after letters begin settling
//             Animated.delay(T_OVERLAP_START),
//             Animated.parallel([ringRotateAnim, particlesAnim, nucleusPop]),
//             // Overlap: start expand while ring still finishing to keep pace
//             Animated.delay(T_OVERLAP_START),
//             Animated.parallel([expand, dissolve]),
//         ]).start(() => {
//             if (mounted && onFinish) onFinish();
//         });

//         return () => {
//             mounted = false;
//         };
//     }, [targetScale]);

//     // Derived transforms
//     const ringRotateDeg = ringRotate.interpolate({
//         inputRange: [0, 1],
//         outputRange: ['0deg', '360deg'],
//     });

//     const particlesTranslate = particlesShift.interpolate({
//         inputRange: [0, 1],
//         outputRange: [0, -10], // subtle upward drift
//     });

//     // Particle small helpers
//     const Particle = ({ size, x, y, delay, opacity = 0.35 }) => {
//         const o = useRef(new Animated.Value(0)).current;
//         useEffect(() => {
//             const anim = Animated.sequence([
//                 Animated.delay(delay),
//                 Animated.timing(o, {
//                     toValue: opacity,
//                     duration: 300,
//                     easing: Easing.out(Easing.quad),
//                     useNativeDriver: true,
//                 }),
//             ]);
//             anim.start();
//         }, []);
//         return (
//             <Animated.View
//                 pointerEvents="none"
//                 style={[
//                     styles.particle,
//                     {
//                         width: size, height: size, borderRadius: size / 2,
//                         left: x, top: y, opacity: o,
//                         transform: [{ translateY: particlesTranslate }],
//                     },
//                 ]}
//             />
//         );
//     };

//     return (
//         <View style={styles.container}>
//             {/* Title with letter stagger */}
//             <View style={styles.content}>
//                 <View style={styles.titleRow}>
//                     {TITLE.map((ch, i) => (
//                         <Animated.Text
//                             key={`${ch}-${i}`}
//                             style={[
//                                 styles.letter,
//                                 {
//                                     opacity: letterOpacities[i],
//                                     transform: [{ translateY: letterY[i] }],
//                                 },
//                             ]}
//                         >
//                             {ch}
//                         </Animated.Text>
//                     ))}
//                 </View>
//             </View>

//             {/* Overlay visuals */}
//             <Animated.View pointerEvents="none" style={[styles.overlay, { opacity: overlayOpacity }]}>
//                 <View style={styles.maskContainer}>
//                     {/* Particles */}
//                     <Particle size={6} x={width * 0.25} y={height * 0.48} delay={120} />
//                     <Particle size={4} x={width * 0.62} y={height * 0.4} delay={220} />
//                     <Particle size={5} x={width * 0.5} y={height * 0.55} delay={300} />
//                     <Particle size={3} x={width * 0.38} y={height * 0.62} delay={260} />
//                     <Particle size={5} x={width * 0.7} y={height * 0.52} delay={200} />

//                     {/* Rotating gradient ring */}
//                     <Animated.View
//                         style={[
//                             styles.ringWrapper,
//                             {
//                                 width: RING_DIAMETER,
//                                 height: RING_DIAMETER,
//                                 borderRadius: RING_DIAMETER / 2,
//                                 transform: [{ rotate: ringRotateDeg }],
//                             },
//                         ]}
//                     >
//                         <LinearGradient
//                             colors={[COLORS?.primary ?? '#3E8EFF', '#8A6CFF', '#00D4FF']}
//                             start={{ x: 0, y: 0 }}
//                             end={{ x: 1, y: 1 }}
//                             style={styles.ringGradient}
//                         />
//                         <View style={styles.ringHole} />
//                     </Animated.View>

//                     {/* Nucleus (spring pop) */}
//                     <Animated.View
//                         style={[
//                             styles.nucleus,
//                             {
//                                 width: CIRCLE_DIAMETER * 0.48,
//                                 height: CIRCLE_DIAMETER * 0.48,
//                                 borderRadius: (CIRCLE_DIAMETER * 0.48) / 2,
//                                 transform: [{ scale: nucleusScale }],
//                             },
//                         ]}
//                     >
//                         <LinearGradient
//                             colors={[COLORS?.primary ?? '#3E8EFF', '#00D4FF']}
//                             start={{ x: 0, y: 0 }}
//                             end={{ x: 1, y: 1 }}
//                             style={StyleSheet.absoluteFill}
//                         />
//                     </Animated.View>

//                     {/* Final expanding reveal */}
//                     <Animated.View
//                         style={[
//                             styles.revealCircle,
//                             {
//                                 width: CIRCLE_DIAMETER,
//                                 height: CIRCLE_DIAMETER,
//                                 borderRadius: CIRCLE_DIAMETER / 2,
//                                 transform: [{ scale: expandScale }],
//                                 backgroundColor: COLORS?.primary ?? '#3E8EFF',
//                             },
//                         ]}
//                     />
//                 </View>
//             </Animated.View>
//         </View>
//     );
// };

// export default Splash;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#0d0f14',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     content: {
//         position: 'absolute',
//         top: 0, bottom: 0, left: 0, right: 0,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     titleRow: {
//         flexDirection: 'row',
//         gap: 2,
//     },
//     letter: {
//         color: '#FFFFFF',
//         fontSize: 42,
//         fontWeight: '800',
//         letterSpacing: 1.4,
//         textShadowColor: 'rgba(0,0,0,0.35)',
//         textShadowOffset: { width: 0, height: 2 },
//         textShadowRadius: 6,
//     },
//     overlay: {
//         position: 'absolute',
//         top: 0, bottom: 0, left: 0, right: 0,
//         backgroundColor: '#0d0f14',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     maskContainer: {
//         position: 'absolute',
//         width,
//         height,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     ringWrapper: {
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     ringGradient: {
//         ...StyleSheet.absoluteFillObject,
//         borderRadius: 999,
//     },
//     ringHole: {
//         width: '70%',
//         height: '70%',
//         borderRadius: 999,
//         backgroundColor: '#0d0f14',
//     },
//     nucleus: {
//         overflow: 'hidden',
//         alignItems: 'center',
//         justifyContent: 'center',
//         shadowColor: '#00D4FF',
//         shadowOpacity: Platform.OS === 'ios' ? 0.45 : 0,
//         shadowRadius: 18,
//         shadowOffset: { width: 0, height: 6 },
//         elevation: 8,
//     },
//     revealCircle: {
//         position: 'absolute',
//     },
//     particle: {
//         position: 'absolute',
//         backgroundColor: '#3E8EFF',
//     },
// });

import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
  NativeModules,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants';
// [ADDED] Import AsyncStorage to check lock status
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const TITLE = 'V Locker'.split('');

// [ADDED] Native Module for Kiosk
const { KioskModule } = NativeModules;

function computeMaxScale(baseDiameter) {
  const rNeeded = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
  const baseRadius = baseDiameter / 2;
  const s = rNeeded / baseRadius;
  return s * 1.12;
}

const Splash = ({ onFinish }) => {
  const BASE = Math.min(width, height);
  const LOCK_BODY = BASE * 0.34; // base circle -> lock body
  const SHACKLE_W = LOCK_BODY * 0.78; // shackle outside width
  const SHACKLE_T = Math.max(3, LOCK_BODY * 0.11); // shackle thickness
  const SHACKLE_H = LOCK_BODY * 0.55; // shackle height
  const KEYHOLE_W = LOCK_BODY * 0.16;
  const KEYHOLE_H = LOCK_BODY * 0.26;

  // Timing (<= 3000ms with overlaps)
  const T_LETTERS = 420;
  const T_RING_ROT = 900;
  const T_LOCK_MORPH = 550; // ring -> shackle
  const T_KEYHOLE = 350;
  const T_GLOW = 300;
  const T_EXPAND = 900;
  const T_DISSOLVE = 380;

  // Letter anims
  const letterOpacities = useRef(
    TITLE.map(() => new Animated.Value(0)),
  ).current;
  const letterY = useRef(TITLE.map(() => new Animated.Value(8))).current;

  // Overlay and reveal
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const revealScale = useRef(new Animated.Value(0)).current;

  // Lock visuals
  const ringRotate = useRef(new Animated.Value(0)).current; // 0..1 -> 0..360deg
  const morph = useRef(new Animated.Value(0)).current; // 0 ring, 1 shackle posed
  const bodyScale = useRef(new Animated.Value(0.7)).current;
  const keyholeOpacity = useRef(new Animated.Value(0)).current;
  const keyGlow = useRef(new Animated.Value(0)).current; // 0..1 glow pulse
  const shieldSweep = useRef(new Animated.Value(0)).current;

  const targetScale = useMemo(() => computeMaxScale(LOCK_BODY), [LOCK_BODY]);

  useEffect(() => {
    let mounted = true;

    // [ADDED] Check Lock Status immediately on splash
    const checkLockAndEnforce = async () => {
      try {
        const localStatus = await AsyncStorage.getItem('DEVICE_LOCK_STATUS');
        console.log('Splash: Checking Lock Status:', localStatus);
        if (localStatus === 'LOCKED') {
          // Try to enable Kiosk Mode immediately if locked
          KioskModule.enableKioskMode && KioskModule.enableKioskMode();
        }
      } catch (e) {
        console.log('Splash Lock Check Error', e);
      }
    };
    checkLockAndEnforce();

    // Letters
    const letterAnims = TITLE.map((_, i) =>
      Animated.parallel([
        Animated.timing(letterOpacities[i], {
          toValue: 1,
          duration: T_LETTERS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(letterY[i], {
          toValue: 0,
          duration: T_LETTERS + 80,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    );

    // Ring rotate, then morph to shackle
    const ringRotateAnim = Animated.timing(ringRotate, {
      toValue: 1,
      duration: T_RING_ROT,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    const morphToShackle = Animated.timing(morph, {
      toValue: 1,
      duration: T_LOCK_MORPH,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    const bodyPop = Animated.spring(bodyScale, {
      toValue: 1,
      stiffness: 220,
      damping: 18,
      mass: 0.7,
      useNativeDriver: true,
    });

    const keyholeIn = Animated.timing(keyholeOpacity, {
      toValue: 1,
      duration: T_KEYHOLE,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    const glowPulse = Animated.sequence([
      Animated.timing(keyGlow, {
        toValue: 1,
        duration: T_GLOW,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(keyGlow, {
        toValue: 0.2,
        duration: 260,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    const sweep = Animated.timing(shieldSweep, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });

    const expandReveal = Animated.timing(revealScale, {
      toValue: targetScale,
      duration: T_EXPAND,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    const dissolve = Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: T_DISSOLVE,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });

    // Timeline with overlaps (<= ~2900ms)
    Animated.sequence([
      Animated.stagger(45, letterAnims), // ~500ms
      Animated.parallel([ringRotateAnim, bodyPop]), // ~900ms
      Animated.parallel([morphToShackle, keyholeIn, glowPulse]), // ~550ms (overlaps next)
      Animated.parallel([sweep, expandReveal, dissolve]), // ~900ms
    ]).start(() => {
      if (mounted && onFinish) onFinish();
    });

    return () => {
      mounted = false;
    };
  }, [targetScale]);

  // Interpolations
  const rotateDeg = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Morph: ring -> shackle slide up and squash into U shape
  const shackleTranslateY = morph.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -LOCK_BODY * 0.32],
  });
  const shackleOpen = morph.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.08], // slight spread to hint U opening
  });
  const shackleRadius = morph.interpolate({
    inputRange: [0, 1],
    outputRange: [999, SHACKLE_W / 2],
  });

  const glowOpacity = keyGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.8],
  });

  const sweepTranslate = shieldSweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-LOCK_BODY * 0.9, LOCK_BODY * 0.9],
  });

  // Keyhole shape: circle + stem
  const Keyhole = () => (
    <Animated.View style={[styles.keyhole, { opacity: keyholeOpacity }]}>
      <View
        style={{
          width: KEYHOLE_W,
          height: KEYHOLE_W,
          borderRadius: KEYHOLE_W / 2,
          backgroundColor: '#0d0f14',
        }}
      />
      <View
        style={{
          width: KEYHOLE_W * 0.38,
          height: KEYHOLE_H,
          borderRadius: 999,
          backgroundColor: '#0d0f14',
          marginTop: -KEYHOLE_W * 0.12,
        }}
      />
    </Animated.View>
  );

  // Rivet dots layout
  const Rivet = ({ x, y, size = 4, delay = 120 }) => {
    const o = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(o, {
          toValue: 0.5,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, []);
    return (
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#000',
          left: x,
          top: y,
          opacity: o,
          zIndex: 10,
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Title with letter stagger */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          {TITLE.map((ch, i) => (
            <Animated.Text
              key={`${ch}-${i}`}
              style={[
                styles.letter,
                {
                  opacity: letterOpacities[i],
                  transform: [{ translateY: letterY[i] }],
                },
              ]}
            >
              {ch}
            </Animated.Text>
          ))}
        </View>
      </View>

      {/* Overlay visuals */}
      <Animated.View
        pointerEvents="none"
        style={[styles.overlay, { opacity: overlayOpacity }]}
      >
        <View style={styles.maskContainer}>
          {/* Lock Body Group */}
          <Animated.View style={{ opacity: 1 /* can allow fade if needed */ }}>
            {/* Shackle Layer (behind body) */}
            <Animated.View
              style={[
                styles.shackle,
                {
                  width: SHACKLE_W,
                  height: SHACKLE_H,
                  // borderWidth: SHACKLE_T,
                  // borderRadius: ... logic logic
                  opacity: morph, // fade in shackle as ring morphs
                  transform: [
                    { translateY: shackleTranslateY },
                    { scaleX: shackleOpen },
                  ],
                },
              ]}
            >
              {/* We draw the U shape manually or use borders. 
                                Let's use a U-shape border view. 
                             */}
              <View
                style={{
                  flex: 1,
                  borderColor: '#E0E0E0',
                  borderWidth: SHACKLE_T,
                  borderBottomWidth: 0,
                  borderTopLeftRadius: SHACKLE_W / 2,
                  borderTopRightRadius: SHACKLE_W / 2,
                }}
              />
            </Animated.View>

            {/* Morphing Ring (Gradient) -> transforms into something else? 
                            Actually let's just rotate the ring and then hide it as the body pops 
                            or let the ring BECOME the body's edge. 
                            Simple approach: Ring rotates, then fades out as Lock Body scales up.
                        */}
            <Animated.View
              style={[
                styles.ringWrapper,
                {
                  width: LOCK_BODY,
                  height: LOCK_BODY,
                  borderRadius: LOCK_BODY / 2,
                  transform: [{ rotate: rotateDeg }],
                  opacity: Animated.subtract(1, morph), // fade out when morph=1
                },
              ]}
            >
              <LinearGradient
                colors={[COLORS?.primary ?? '#3E8EFF', '#8A6CFF', '#00D4FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ringGradient}
              />
              <View style={styles.ringHole} />
            </Animated.View>

            {/* Main Lock Body (Blue Gradient Square-ish) */}
            <Animated.View
              style={[
                styles.lockBody,
                {
                  width: LOCK_BODY,
                  height: LOCK_BODY * 0.85,
                  transform: [{ scale: bodyScale }],
                },
              ]}
            >
              <LinearGradient
                colors={[COLORS?.primary ?? '#3E8EFF', '#0044FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.lockGradient}
              />

              {/* Shine / Reflection (Sweep) */}
              <View
                style={{
                  overflow: 'hidden',
                  ...StyleSheet.absoluteFillObject,
                  borderRadius: 16,
                }}
              >
                <Animated.View
                  style={{
                    width: LOCK_BODY * 0.4,
                    height: '140%',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    transform: [
                      { rotate: '20deg' },
                      { translateX: sweepTranslate },
                    ],
                  }}
                />
              </View>

              {/* Keyhole */}
              <Keyhole />

              {/* Glow from keyhole */}
              <Animated.View
                style={[
                  styles.keyGlow,
                  {
                    width: KEYHOLE_W * 2,
                    height: KEYHOLE_W * 2,
                    borderRadius: KEYHOLE_W,
                    opacity: glowOpacity,
                  },
                ]}
              />

              {/* Rivets */}
              <Rivet x={12} y={12} />
              <Rivet x={LOCK_BODY - 16} y={12} />
              <Rivet x={12} y={LOCK_BODY * 0.85 - 16} />
              <Rivet x={LOCK_BODY - 16} y={LOCK_BODY * 0.85 - 16} />
            </Animated.View>
          </Animated.View>

          {/* Final Expanding Circle (Reveal) */}
          <Animated.View
            style={[
              styles.revealCircle,
              {
                width: LOCK_BODY,
                height: LOCK_BODY,
                borderRadius: LOCK_BODY / 2,
                transform: [{ scale: revealScale }],
                backgroundColor: COLORS?.primary ?? '#3E8EFF',
              },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0f14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    gap: 2,
  },
  letter: {
    color: '#FFFFFF',
    fontSize: fontSize(42),
    fontWeight: '800',
    letterSpacing: 1.4,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0d0f14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskContainer: {
    position: 'absolute',
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrapper: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
  },
  ringHole: {
    width: '74%',
    height: '74%',
    borderRadius: 999,
    backgroundColor: '#0d0f14',
  },
  lockBody: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
    zIndex: 5,
  },
  lockGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  shackle: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    zIndex: 1,
  },
  keyhole: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  keyGlow: {
    position: 'absolute',
    backgroundColor: '#40E0D0', // cyan glow
    zIndex: -1,
    filter: 'blur(10px)', // works on web, ignored on native usually (needs image blur)
    // native fallback often handled by shadow or an image asset
  },
  revealCircle: {
    position: 'absolute',
    zIndex: 20,
  },
});
