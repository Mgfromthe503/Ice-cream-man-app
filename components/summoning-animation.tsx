import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, Platform } from 'react-native';
import { useAudioPlayer } from 'expo-audio';

const ICE_CREAM_FACTS = [
  "🍦 Who invented ice cream? The Chinese did around 200 BC!",
  "🚚 Summoning your local ice cream dealer...",
  "🍨 Did you know it's illegal to eat ice cream on Sundays in Kentucky?",
  "🍦 The average American eats 23 pounds of ice cream per year!",
  "🚚 Still locating your local ice cream dealer...",
  "🍫 Chocolate was the first ice cream flavor invented!",
  "🤰 Sorry if you're pregnant - you definitely shouldn't have to wait this long for ice cream! You deserve it delivered ASAP!",
  "🍦 It takes about 50 licks to finish a single scoop cone!",
  "🚚 Your ice cream man is putting on his cool shades...",
  "🍨 Ice cream headaches (brain freeze) last about 30 seconds!",
  "🌎 New Zealand eats more ice cream per capita than any other country!",
  "🍦 The tallest ice cream cone ever was over 9 feet tall!",
  "🚚 Beep beep! The truck is warming up...",
  "🤰 Pregnant? Don't worry, we're rushing your ice cream man to you! No one should wait when cravings hit!",
  "🍦 Vanilla is the world's most popular ice cream flavor!",
  "🚚 Your ice cream man is loading up the good stuff...",
  "🍨 The first ice cream truck appeared in 1920!",
  "🍦 It takes 3 gallons of milk to make 1 gallon of ice cream!",
  "🚚 Almost there... your ice cream man is on a mission!",
  "🍫 Rocky Road was invented during the Great Depression to cheer people up!",
  "🤰 Hey mama-to-be! Your cravings are valid and ice cream is on the way!",
  "🍦 Sunday is the most popular day to eat ice cream!",
  "🚚 Your neighborhood ice cream hero is suiting up...",
  "🍨 The most popular ice cream topping is chocolate syrup!",
  "🍦 California produces the most ice cream in the US!",
  "🚚 Activating ice cream bat signal... 🦇🍦",
  "🍨 One cow gives enough milk for 9,000 gallons of ice cream in her lifetime!",
  "🤰 Expecting moms get priority! (Not really, but we wish we could!)",
  "🍦 NASA astronauts eat freeze-dried ice cream in space!",
  "🚚 Your ice cream man just cranked up the jingle...",
];

const SUMMONING_PHASES = [
  "✨ Summoning Ice Cream Man ✨",
  "🔮 Sending ice cream vibes...",
  "📡 Broadcasting to nearby trucks...",
  "🍦 Ice cream radar activated!",
  "🚚 Truck located! On the way...",
];

// Use require for bundled asset
const jingleSource = require('../assets/ice-cream-jingle.mp3');

interface SummoningAnimationProps {
  isActive: boolean;
  phase?: 'summoning' | 'searching' | 'found' | 'onTheWay';
}

export function SummoningAnimation({ isActive, phase = 'summoning' }: SummoningAnimationProps) {
  const [currentFact, setCurrentFact] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const truckAnim = useRef(new Animated.Value(-50)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;

  // Audio player for the jingle
  const player = useAudioPlayer(jingleSource);

  // Play/stop jingle when animation activates
  useEffect(() => {
    if (isActive && player) {
      try {
        player.loop = true;
        player.volume = 0.5;
        player.play();
      } catch (e) {
        // Audio may not be available on all platforms
        console.log('Audio playback not available:', e);
      }
    } else if (!isActive && player) {
      try {
        player.pause();
        player.seekTo(0);
      } catch (e) {
        // Ignore errors on pause
      }
    }
  }, [isActive, player]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (player) {
        try {
          player.release();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  // Pulse animation for the summoning circle
  useEffect(() => {
    if (!isActive) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isActive]);

  // Truck driving animation
  useEffect(() => {
    if (!isActive) return;
    const drive = Animated.loop(
      Animated.sequence([
        Animated.timing(truckAnim, {
          toValue: 300,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(truckAnim, {
          toValue: -50,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    drive.start();
    return () => drive.stop();
  }, [isActive]);

  // Cycle through facts every 4 seconds
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      // Fade out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Change fact
        setCurrentFact((prev) => (prev + 1) % ICE_CREAM_FACTS.length);
        slideAnim.setValue(30);
        // Fade in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 4000);

    // Initial fade in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    return () => clearInterval(interval);
  }, [isActive]);

  // Cycle through summoning phases
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setCurrentPhase((prev) => (prev + 1) % SUMMONING_PHASES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isActive]);

  // Loading dots animation
  useEffect(() => {
    if (!isActive) return;
    const dots = Animated.loop(
      Animated.timing(dotsAnim, {
        toValue: 3,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    dots.start();
    return () => dots.stop();
  }, [isActive]);

  if (!isActive) return null;

  return (
    <View className="items-center gap-4 py-4">
      {/* Jingle Playing Indicator */}
      <View className="flex-row items-center gap-2 bg-surface rounded-full px-4 py-2">
        <Text style={{ fontSize: 16 }}>🎵</Text>
        <Text className="text-xs text-muted font-medium">Ice cream jingle playing...</Text>
        <Text style={{ fontSize: 16 }}>🎶</Text>
      </View>

      {/* Summoning Circle with Pulse */}
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: '#FFB6D9',
          borderWidth: 4,
          borderColor: '#FF69B4',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#FF69B4',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        <Text style={{ fontSize: 50 }}>🍦</Text>
      </Animated.View>

      {/* Summoning Phase Text */}
      <Text className="text-lg font-bold text-primary text-center">
        {SUMMONING_PHASES[currentPhase]}
      </Text>

      {/* Animated Truck Driving Across */}
      <View className="w-full h-10 overflow-hidden rounded-lg bg-surface">
        <Animated.View
          style={{
            transform: [{ translateX: truckAnim }],
            position: 'absolute',
            top: 4,
          }}
        >
          <Text style={{ fontSize: 32 }}>🚚💨</Text>
        </Animated.View>
        {/* Road line */}
        <View
          style={{
            position: 'absolute',
            bottom: 8,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: '#ccc',
          }}
        />
      </View>

      {/* Fun Fact Bubble */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          width: '100%',
        }}
      >
        <View
          className="bg-surface rounded-2xl p-4 border-2 border-primary"
          style={{
            shadowColor: '#FF69B4',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text className="text-sm text-foreground text-center leading-5">
            {ICE_CREAM_FACTS[currentFact]}
          </Text>
        </View>
      </Animated.View>

      {/* Ice cream emojis floating */}
      <View className="flex-row justify-center gap-3">
        <Text className="text-2xl">🍦</Text>
        <Text className="text-2xl">🍨</Text>
        <Text className="text-2xl">🍧</Text>
        <Text className="text-2xl">🍫</Text>
        <Text className="text-2xl">🍦</Text>
      </View>
    </View>
  );
}
