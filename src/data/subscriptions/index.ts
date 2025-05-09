
import { Subscription } from "@/types/subscriptionTypes";
import { streamingSubscriptions } from "./streamingSubscriptions";
import { educationSubscriptions } from "./educationSubscriptions";
import { musicSubscriptions } from "./musicSubscriptions";
import { youtubeSubscriptions } from "./youtubeSubscriptions";
import { productivitySubscriptions } from "./productivitySubscriptions";

// Helper function to sort subscriptions by date (newest first)
const sortByDateDesc = (subscriptions: Subscription[]) => {
  return [...subscriptions].sort((a, b) => {
    if (!a.added_date) return 1;
    if (!b.added_date) return -1;
    
    const dateA = a.added_date.split('/').reverse().join('');
    const dateB = b.added_date.split('/').reverse().join('');
    
    return dateB.localeCompare(dateA);
  });
};

// Combine all subscriptions into one array
const allSubscriptions = [
  ...streamingSubscriptions,
  ...educationSubscriptions,
  ...musicSubscriptions,
  ...youtubeSubscriptions,
  ...productivitySubscriptions
];

// Sort all subscriptions by date (newest first)
export const subscriptions: Subscription[] = sortByDateDesc(allSubscriptions);

// Define featured subscriptions (first 5 subscriptions)
export const featuredSubscriptions: Subscription[] = subscriptions.slice(0, 5);

// All other subscriptions are regular
export const regularSubscriptions: Subscription[] = subscriptions.slice(5);
