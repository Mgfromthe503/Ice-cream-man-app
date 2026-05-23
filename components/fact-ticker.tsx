import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';

/**
 * FactTicker - A reusable component that displays rotating ice cream fun facts.
 * 
 * Shows a new random fact every 4 seconds with a smooth fade/slide animation.
 * Can be placed on any screen to keep users entertained while waiting.
 * 
 * Props:
 * - variant: 'compact' | 'card' | 'banner' - visual style
 * - intervalMs: how often to rotate (default 4000ms)
 */

const ICE_CREAM_FACTS = [
  // Bizarre Flavor Failures
  "🇯🇵 Garlic and squid ink ice cream flavors actually exist in Japan!",
  "🌭 Hot dog flavored ice cream was once trialed by a major brand. Yes, really.",
  "🦗 Cicada-flavored ice cream sold out in Missouri after using real bugs!",
  "🐴 Horseradish ice cream is a real gourmet flavor served with steak!",
  // Brain Freeze & Bodily Reactions
  "🧠 Brain freeze happens because blood vessels in your mouth panic!",
  "🤓 'Sphenopalatine ganglioneuralgia' is the scientific name for brain freeze.",
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
  "🧠 Eating ice cream lights up the SAME pleasure centers as winning the lottery!",
  "💨 Cheap ice cream is pumped with up to 50% air. You're paying to eat frozen air!",
  "❄️ Anchorage, Alaska is a top ice cream city - cravings ignore the weather!",
  "🌿 Seaweed extract keeps your ice cream from melting into sad soup.",
  // Hilarious Historical Disasters
  "🩻 Victorian 'penny lick' vendors reused glass cups WITHOUT washing - a health disaster!",
  "💰 George Washington's ice cream habit cost thousands in today's dollars!",
  "🎪 The ice cream cone was born from CHAOS at the 1904 World's Fair!",
  "⚓ During WWII, the US Navy spent $1 MILLION on a floating ice cream parlor!",
  // Wild Ice Cream Laws
  "🐎 Ice cream in your back pocket? Illegal - horse thieves used it to lure horses!",
  "🎬 Clint Eastwood ran for mayor to repeal a ban on eating ice cream on sidewalks!",
  // Funny Waiting Phrases
  "🚚 Your ice cream man is putting on his cool shades...",
  "🚚 Beep beep! The truck is warming up...",
  "🚚 Your ice cream man is loading up the good stuff...",
  "🚚 Activating ice cream bat signal... 🦇🍦",
  "🍦 Fun fact: It takes about 50 licks to finish a single scoop cone!",
  "🍫 Rocky Road was invented during the Great Depression to cheer people up!",
  "🍦 NASA astronauts eat freeze-dried ice cream in space!",
  "🐄 One cow gives enough milk for 9,000 gallons of ice cream in her lifetime!",
  "🍦 It takes 3 gallons of milk to make 1 gallon of ice cream!",
  "🤰 Pregnant? Your cravings are valid and ice cream is always the answer!",
  "🧊 The first ice cream truck appeared in 1920 in the United States!",
  "🌍 New Zealand eats more ice cream per capita than any other country!",
  "🎂 Ice cream cake was invented because people couldn't choose between the two!",
  "🏭 The largest ice cream factory in the world makes 100 million gallons a year!",
];

interface FactTickerProps {
  variant?: 'compact' | 'card' | 'banner';
  intervalMs?: number;
}

export function FactTicker({ variant = 'card', intervalMs = 4000 }: FactTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * ICE_CREAM_FACTS.length));
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out + slide up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -15,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Change fact
        setCurrentIndex((prev) => (prev + 1) % ICE_CREAM_FACTS.length);
        slideAnim.setValue(20);
        // Fade in + slide down
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 350,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 350,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  const fact = ICE_CREAM_FACTS[currentIndex];

  if (variant === 'compact') {
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Text style={{ fontSize: 12, color: '#8B4513', textAlign: 'center', lineHeight: 18 }}>
          {fact}
        </Text>
      </Animated.View>
    );
  }

  if (variant === 'banner') {
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: 'rgba(255, 182, 217, 0.3)',
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 10,
        }}
      >
        <Text style={{ fontSize: 12, color: '#8B4513', textAlign: 'center', lineHeight: 18, fontWeight: '500' }}>
          {fact}
        </Text>
      </Animated.View>
    );
  }

  // Default: 'card' variant
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        backgroundColor: '#FFF8DC',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1.5,
        borderColor: '#FFB6D9',
        shadowColor: '#FF69B4',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Text style={{ fontSize: 14 }}>🍦</Text>
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#FF69B4', letterSpacing: 0.5 }}>
          DID YOU KNOW?
        </Text>
        <Text style={{ fontSize: 14 }}>🍦</Text>
      </View>
      <Text style={{ fontSize: 13, color: '#5D3A1A', textAlign: 'center', lineHeight: 20 }}>
        {fact}
      </Text>
    </Animated.View>
  );
}
