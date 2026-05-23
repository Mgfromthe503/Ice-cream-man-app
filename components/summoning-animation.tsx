import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, Platform } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

const ICE_CREAM_FACTS = [
  // Bizarre Flavor Failures
  "🇯🇵 Garlic and squid ink ice cream flavors actually exist in Japan!",
  "🌭 Hot dog flavored ice cream was once trialed by a major brand. Yes, really.",
  "🦗 Cicada-flavored ice cream sold out in Missouri after using real bugs!",
  "🐴 Horseradish ice cream is a real gourmet flavor served with steak!",
  // Brain Freeze & Bodily Reactions
  "🧠 Brain freeze happens because blood vessels in your mouth panic!",
  "🤓 'Sphenopalatine ganglioneuralgia' is the overly dramatic scientific name for brain freeze.",
  "🐱 Cats get brain freeze too, which results in hilarious viral videos!",
  "🥄 Ice cream testers use gold spoons because plastic taints the flavor!",
  // Ridiculous Historical Trivia
  "🇺🇸 George Washington spent $200 on ice cream in a single summer!",
  "🏛️ Roman Emperor Nero sent slaves to fetch snow just for flavoring!",
  "🎪 Ice cream cones were invented entirely by accident at a World's Fair!",
  "👑 Charles I of England paid his chef to keep ice cream a royal secret!",
  // Strange Laws & Myths
  "🍌 Hawaii has a 'Banana Apple' fruit that tastes exactly like ice cream!",
  "🤮 Industrial ice cream tasters swallow nothing - they spit it ALL out!",
  "⚰️ Ben & Jerry's has a physical 'Flavor Graveyard' for dead flavors!",
  "👖 In Kentucky, it is illegal to carry an ice cream cone in your pocket!",
  // Marketing & Media Madness
  "🎵 Ice cream trucks originally played music to drown out engine noise!",
  "🥔 Food stylists use mashed potatoes in commercials because real ice cream melts!",
  "🏔️ The world's tallest cone was over nine feet high in Norway!",
  "⛪ Sunday became 'Sundae' because religious laws banned selling soda on Sundays!",
  // Mind-Boggling Statistics
  "📊 The average American eats about 20 quarts of ice cream a year!",
  "💨 Air makes up 50% of the volume in cheap ice cream!",
  "👅 Brain freeze cure: press your tongue to the roof of your mouth!",
  "🇺🇸 July is National Ice Cream Month thanks to President Ronald Reagan!",
  "🍦 Vanilla is the most popular flavor, proving humans are deeply predictable.",
  // Ice Cream Science & Cravings
  "🧠 Brain scans show eating ice cream lights up the SAME pleasure centers as winning the lottery!",
  "💨 Cheap ice cream is pumped with up to 50% air (called 'overrun'). You're literally paying to eat sweetened frozen air!",
  "❄️ Top-selling ice cream cities include Anchorage, Alaska - proving our cravings ignore the weather entirely!",
  "🌿 The industry uses seaweed extract (carrageenan) as a secret stabilizer to keep your ice cream from melting into sad soup.",
  // Hilarious Historical Disasters
  "🩻 In Victorian London, 'penny lick' vendors sold ice cream in glass cups licked clean and refilled WITHOUT washing - a citywide health disaster!",
  "💰 George Washington loved ice cream so much he spent $200 in one summer (worth thousands today)!",
  "🎪 The ice cream cone was born from CHAOS at the 1904 World's Fair when a vendor ran out of dishes!",
  "⚓ During WWII, the US Navy spent $1 MILLION converting a barge into a floating ice cream parlor!",
  // Wild Ice Cream Laws
  "🐎 It's illegal to walk with an ice cream cone in your back pocket in some states - horse thieves used it to lure horses!",
  "🤫 Oregon urban legend: ice cream may not be eaten on Sundays in public!",
  "🎬 Clint Eastwood ran for mayor to repeal the ban on eating ice cream on sidewalks. He won!",
  // Funny Waiting Phrases
  "🚚 Summoning your local ice cream dealer...",
  "🚚 Still locating your local ice cream dealer...",
  "🚚 Your ice cream man is putting on his cool shades...",
  "🚚 Beep beep! The truck is warming up...",
  "🚚 Your ice cream man is loading up the good stuff...",
  "🚚 Almost there... your ice cream man is on a mission!",
  "🚚 Your neighborhood ice cream hero is suiting up...",
  "🚚 Activating ice cream bat signal... 🦇🍦",
  "🚚 Your ice cream man just cranked up the jingle...",
  "🤰 Sorry if you're pregnant - you definitely shouldn't have to wait this long for ice cream!",
  "🤰 Pregnant? Don't worry, we're rushing your ice cream man to you!",
  "🤰 Hey mama-to-be! Your cravings are valid and ice cream is on the way!",
  "🤰 Expecting moms get priority! (Not really, but we wish we could!)",
  "🍦 Fun fact: It takes about 50 licks to finish a single scoop cone!",
  "🍫 Rocky Road was invented during the Great Depression to cheer people up!",
  "🍦 NASA astronauts eat freeze-dried ice cream in space!",
  "🐄 One cow gives enough milk for 9,000 gallons of ice cream in her lifetime!",
  "🍦 It takes 3 gallons of milk to make 1 gallon of ice cream!",
];

const SUMMONING_PHASES = [
  "✨ Summoning Ice Cream Man ✨",
  "🔮 Sending ice cream vibes...",
  "📡 Broadcasting to nearby trucks...",
  "🍦 Ice cream radar activated!",
  "🚚 Truck located! On the way...",
];

// Use the SHORT snippet (8 seconds with fade out) - not the full 21-second track
const jingleSource = require('../assets/ice-cream-jingle-short.mp3');

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

  // Track whether jingle has already played for THIS activation cycle
  const hasPlayedRef = useRef(false);
  const prevActiveRef = useRef(false);

  // Audio player - NO loop option
  const player = useAudioPlayer(jingleSource);
  const status = useAudioPlayerStatus(player);

  // Play jingle ONCE when animation activates - prevents stacking
  useEffect(() => {
    // Detect fresh activation (was inactive, now active)
    if (isActive && !prevActiveRef.current) {
      hasPlayedRef.current = false; // Reset for new order
    }
    prevActiveRef.current = isActive;

    if (isActive && player && !hasPlayedRef.current) {
      try {
        hasPlayedRef.current = true; // Mark immediately to prevent double-play
        player.volume = 0.5;
        player.seekTo(0);
        player.play();
      } catch (e) {
        console.log('Audio playback not available:', e);
      }
    }

    if (!isActive && player) {
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

  if (!isActive) return null;

  return (
    <View style={{ alignItems: 'center', gap: 16, paddingVertical: 16 }}>
      {/* Jingle Playing Indicator - only shows while audio is actually playing */}
      {status.playing && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF0F5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 }}>
          <Text style={{ fontSize: 16 }}>🎵</Text>
          <Text style={{ fontSize: 12, color: '#A0826D', fontWeight: '500' }}>Ice cream jingle playing...</Text>
          <Text style={{ fontSize: 16 }}>🎶</Text>
        </View>
      )}

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
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF69B4', textAlign: 'center' }}>
        {SUMMONING_PHASES[currentPhase]}
      </Text>

      {/* Animated Truck Driving Across */}
      <View style={{ width: '100%', height: 40, overflow: 'hidden', borderRadius: 8, backgroundColor: '#FFF0F5' }}>
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
          style={{
            backgroundColor: '#FFF8DC',
            borderRadius: 16,
            padding: 16,
            borderWidth: 2,
            borderColor: '#FF69B4',
            shadowColor: '#FF69B4',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text style={{ fontSize: 13, color: '#8B4513', textAlign: 'center', lineHeight: 20 }}>
            {ICE_CREAM_FACTS[currentFact]}
          </Text>
        </View>
      </Animated.View>

      {/* Ice cream emojis floating */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
        <Text style={{ fontSize: 24 }}>🍦</Text>
        <Text style={{ fontSize: 24 }}>🍨</Text>
        <Text style={{ fontSize: 24 }}>🍧</Text>
        <Text style={{ fontSize: 24 }}>🍫</Text>
        <Text style={{ fontSize: 24 }}>🍦</Text>
      </View>
    </View>
  );
}
