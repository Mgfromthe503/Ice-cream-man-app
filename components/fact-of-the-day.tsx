import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DAILY_FACTS = [
  "🧠 Brain scans show eating ice cream lights up the SAME pleasure centers as winning the lottery!",
  "🐎 In several southern states, it's illegal to walk with an ice cream cone in your back pocket - because horse thieves used it to lure horses!",
  "🎬 Clint Eastwood ran for mayor of Carmel, CA to repeal the ban on eating ice cream on sidewalks. He won!",
  "⚓ During WWII, the US Navy spent $1 MILLION converting a concrete barge into a floating ice cream parlor for sailors.",
  "🎪 The ice cream cone was born from CHAOS at the 1904 World's Fair when a vendor ran out of dishes!",
  "🏥 In the mid-20th century, mental institutions used 'ice cream therapy' photo ops to cover up abuse inside.",
  "💰 George Washington spent $200 (worth thousands today) on ice cream in a single summer!",
  "🇯🇵 Garlic and squid ink ice cream flavors actually exist in Japan!",
  "🦗 Cicada-flavored ice cream sold out in Missouri after using real bugs!",
  "🥄 Ice cream testers use gold spoons because plastic taints the flavor!",
  "🐱 Cats get brain freeze too, which results in hilarious viral videos!",
  "👑 Charles I of England paid his chef to keep ice cream a royal secret!",
  "⚰️ Ben & Jerry's has a physical 'Flavor Graveyard' for dead flavors!",
  "🥔 Food stylists use mashed potatoes in commercials because real ice cream melts!",
  "⛪ Sunday became 'Sundae' because religious laws banned selling soda on Sundays!",
  "💨 Cheap ice cream is pumped with up to 50% air. You're literally paying to eat sweetened frozen air!",
  "❄️ Top-selling ice cream cities include Anchorage, Alaska - proving cravings ignore the weather!",
  "🌿 The industry uses seaweed extract as a secret stabilizer to keep ice cream from melting into sad soup.",
  "🩻 Victorian London 'penny lick' vendors refilled glass cups WITHOUT washing - creating a health disaster!",
  "🤫 Oregon urban legend: ice cream may not be eaten on Sundays in public. The loophole? Ice cream SUNDAES!",
  "🏛️ Roman Emperor Nero sent slaves to fetch mountain snow just for flavoring!",
  "📊 The average American eats about 20 quarts of ice cream a year!",
  "🇺🇸 July is National Ice Cream Month thanks to President Ronald Reagan!",
  "🍦 Vanilla is the most popular flavor, proving humans are deeply predictable.",
  "🎵 Ice cream trucks originally played music to drown out engine noise!",
  "🏔️ The world's tallest cone was over nine feet high in Norway!",
  "🍫 Rocky Road was invented during the Great Depression to cheer people up!",
  "🐄 One cow gives enough milk for 9,000 gallons of ice cream in her lifetime!",
  "🍦 It takes 3 gallons of milk to make 1 gallon of ice cream!",
  "🍦 NASA astronauts eat freeze-dried ice cream in space!",
  "📰 Institutions invited photographers to shoot patients eating ice cream on the lawn - hiding the truth inside.",
];

function getDailyFact(): string {
  // Use the day of the year to pick a fact - changes once per day
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return DAILY_FACTS[dayOfYear % DAILY_FACTS.length];
}

export function FactOfTheDay() {
  const [fact, setFact] = useState(getDailyFact());

  useEffect(() => {
    setFact(getDailyFact());
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>📅</Text>
        <Text style={styles.headerText}>Ice Cream Fact of the Day</Text>
      </View>
      <Text style={styles.factText}>{fact}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF8E7',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: '#FFD93D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B4513',
    letterSpacing: 0.5,
  },
  factText: {
    fontSize: 15,
    color: '#5D3A1A',
    lineHeight: 22,
    fontStyle: 'italic',
  },
});
