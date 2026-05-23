import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, Platform } from 'react-native';
import { useAudioPlayer } from 'expo-audio';

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
  "🩻 In Victorian London, 'penny lick' vendors sold ice cream in glass cups. Customers licked them clean and vendors refilled them WITHOUT washing - creating a citywide health disaster!",
  "💰 George Washington loved ice cream so much he spent $200 in one summer (worth thousands today), leaving his accounting books looking absolutely ridiculous!",
  "🎪 The ice cream cone was born from CHAOS at the 1904 World's Fair. A vendor ran out of dishes, panicked, and teamed up with a waffle vendor to save his business!",
  "⚓ During WWII, the US Navy spent $1 MILLION converting a concrete barge into a floating ice cream parlor to lift sailor morale. Enemy intelligence was absolutely confused.",
  // Wild Ice Cream Laws
  "🐎 In several southern states, it's illegal to walk with an ice cream cone in your back pocket. Why? Horse thieves used it to lure horses away from farms!",
  "🐎 The pocket-cone law exists because thieves would claim the horse 'just followed them.' Lawmakers banned the technique entirely!",
  "🤫 Oregon urban legend: ice cream may not be eaten on Sundays in public. The loophole? This didn't apply to ice cream SUNDAES!",
  "🎬 Clint Eastwood ran for mayor of Carmel, CA on a campaign promise to repeal the ban on eating ice cream on sidewalks. He won and immediately struck down the law!",
  "🎬 In Carmel, CA it used to be illegal to eat ice cream while standing on a public sidewalk - to prevent sticky melted messes on city streets!",
  // Ice Cream's Dark History
  "🏥 Dark history: In the mid-20th century, mental institutions used 'ice cream therapy' as a PR cover-up for experimental procedures and neglect.",
  "📰 Facilities conducting harsh experiments would invite photographers to shoot patients smiling and eating ice cream on the lawn - hiding the truth.",
  "🏥 The upbeat 'ice cream on the lawn' media coverage successfully distracted the public and inspectors from investigating human rights abuses inside.",
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
  "🤰 Sorry if you're pregnant - you definitely shouldn't have to wait this long for ice cream! You deserve it delivered ASAP!",
  "🤰 Pregnant? Don't worry, we're rushing your ice cream man to you! No one should wait when cravings hit!",
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

  // Cycle through facts every 6 seconds for comfortable reading pace
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
    }, 6000);

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
