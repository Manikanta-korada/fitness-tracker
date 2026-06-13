const quotes = [
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Your body can stand almost anything. It's your mind that you have to convince.", author: "Unknown" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
  { text: "Success isn't always about greatness. It's about consistency.", author: "Dwayne Johnson" },
  { text: "Don't count the days. Make the days count.", author: "Muhammad Ali" },
  { text: "The difference between try and triumph is a little umph.", author: "Marvin Phillips" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "What seems impossible today will become your warm-up tomorrow.", author: "Unknown" },
  { text: "Motivation gets you started. Habit keeps you going.", author: "Jim Ryun" },
  { text: "You don't have to be extreme, just consistent.", author: "Unknown" },
  { text: "The best project you'll ever work on is you.", author: "Unknown" },
  { text: "Strive for progress, not perfection.", author: "Unknown" },
  { text: "Strength does not come from the body. It comes from the will.", author: "Unknown" },
  { text: "It never gets easier. You just get stronger.", author: "Unknown" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Unknown" },
  { text: "The hard days are what make you stronger.", author: "Aly Raisman" },
  { text: "Push yourself because no one else is going to do it for you.", author: "Unknown" },
  { text: "When you feel like quitting, think about why you started.", author: "Unknown" },
  { text: "Your health is an investment, not an expense.", author: "Unknown" },
  { text: "If it doesn't challenge you, it doesn't change you.", author: "Fred DeVito" },
  { text: "No matter how slow you go, you're still lapping everybody on the couch.", author: "Unknown" },
  { text: "One workout at a time. One meal at a time. One day at a time.", author: "Unknown" },
  { text: "Results happen over time, not overnight. Work hard, stay consistent, and be patient.", author: "Unknown" },
  { text: "You are what you eat, so don't be fast, cheap, easy, or fake.", author: "Unknown" },
  { text: "The body achieves what the mind believes.", author: "Unknown" },
  { text: "Today I will do what others won't, so tomorrow I can do what others can't.", author: "Jerry Rice" },
  { text: "Sweat is just fat crying.", author: "Unknown" },
  { text: "Eat clean, train dirty.", author: "Unknown" },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { text: "Fall in love with taking care of yourself.", author: "Unknown" },
];

export function getDailyQuote() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  return quotes[dayOfYear % quotes.length];
}
