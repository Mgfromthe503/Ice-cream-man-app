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
  // WILD & BIZARRE FACTS
  "🚀 NASA astronauts eat freeze-dried ice cream in space! It's the only dessert that survives zero gravity!",
  "🇯🇵 In Japan, you can get squid ink, garlic, and wasabi ice cream - and people actually love it!",
  "🐴 Horseradish ice cream is a real thing served at fancy steakhouses. Sounds weird, tastes amazing!",
  "🌭 Hot dog-flavored ice cream was created by a major brand. The internet had OPINIONS.",
  "🦗 Cicada-flavored ice cream sold out in Missouri. Yes, it had real bugs in it!",
  "🍌 There's a fruit called 'Banana Apple' in Hawaii that tastes exactly like vanilla ice cream!",
  "🥔 Food stylists in commercials use mashed potatoes instead of real ice cream because it doesn't melt!",
  "🤮 Professional ice cream tasters spit out EVERYTHING - they never swallow. It's all about the taste!",
  "⚰️ Ben & Jerry's has an actual 'Flavor Graveyard' where discontinued flavors get a proper funeral!",
  "🏔️ The world's tallest ice cream cone was over 9 feet high in Norway. It took a crane to eat it!",
  
  // MIND-BLOWING HISTORY
  "🇺🇸 George Washington spent $200 on ice cream in ONE summer in 1790. That's $5,000+ in today's money!",
  "👑 King Charles I of England paid his chef a fortune to keep ice cream a royal secret!",
  "🏛️ Roman Emperor Nero sent slaves to the mountains to fetch snow just to flavor his desserts!",
  "🎪 The ice cream cone was invented by ACCIDENT at the 1904 World's Fair when a waffle vendor ran out of dishes!",
  "⚓ During WWII, the US Navy built a FLOATING ICE CREAM PARLOR and spent $1 MILLION on it!",
  "🎬 Clint Eastwood actually ran for mayor to repeal a ban on eating ice cream on sidewalks!",
  "🩻 Victorian 'penny lick' vendors reused the same glass cup for every customer WITHOUT WASHING. Gross!",
  "⛪ 'Sundae' got its name because religious laws banned selling soda on Sundays, so they renamed it!",
  "🎵 Ice cream truck music was originally played to DROWN OUT the loud engine noise!",

  
  // SCIENCE STUFF THAT'S ACTUALLY COOL
  "🧠 Eating ice cream triggers the EXACT SAME pleasure centers in your brain as winning the lottery!",
  "💨 Cheap ice cream is 50% AIR. You're literally paying to eat frozen air!",
  "🥄 Professional ice cream tasters use GOLD SPOONS because plastic taints the flavor!",
  "🧠 Brain freeze happens when blood vessels in your mouth suddenly constrict. The scientific name is 'Sphenopalatine ganglioneuralgia'!",
  "👅 Quick brain freeze fix: Press your tongue hard against the roof of your mouth!",
  "🐱 Cats get brain freeze too - that's why you see viral videos of them freaking out!",
  "🌿 Seaweed extract is in most ice cream to keep it from melting into sad soup!",
  "❄️ Anchorage, Alaska is one of the top ice cream-consuming cities in the US. Cold weather = MORE ice cream!",
  "🍦 It takes 3 gallons of milk to make just 1 gallon of ice cream!",
  "🐄 One cow produces enough milk in her lifetime to make 9,000 gallons of ice cream!",
  
  // WILD STATISTICS
  "📊 Americans eat about 20 quarts of ice cream per person PER YEAR!",
  "🌍 New Zealand eats more ice cream per capita than ANY other country in the world!",
  "🍦 Vanilla is the #1 flavor worldwide - humans really ARE predictable!",
  "🍫 Rocky Road was invented during the Great Depression to cheer people up!",
  "🎂 Ice cream cake was invented because people couldn't choose between cake and ice cream!",
  "🏭 The world's largest ice cream factory makes 100 MILLION gallons per year!",
  "🇺🇸 July is National Ice Cream Month thanks to President Ronald Reagan!",
  "🧊 The first ice cream truck in America appeared in 1920!",
  "🍦 It takes about 50 licks to finish a single scoop cone!",
  "🤰 Pregnant women crave ice cream more than any other food - it's totally valid!",
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
        // Change fact - pick a random one instead of sequential
        setCurrentIndex(Math.floor(Math.random() * ICE_CREAM_FACTS.length));
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
