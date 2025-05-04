
import { SubscriptionData } from "@/types/subscriptionTypes";
import { streamingSubscriptions } from "./streamingSubscriptions";
import { educationSubscriptions } from "./educationSubscriptions";
import { musicSubscriptions } from "./musicSubscriptions";
import { youtubeSubscriptions } from "./youtubeSubscriptions";
import { productivitySubscriptions } from "./productivitySubscriptions";

// Helper function to sort subscriptions by date (newest first)
const sortByDateDesc = (subscriptions: SubscriptionData[]) => {
  return [...subscriptions].sort((a, b) => {
    if (!a.addedDate) return 1;
    if (!b.addedDate) return -1;
    
    const dateA = a.addedDate.split('/').reverse().join('');
    const dateB = b.addedDate.split('/').reverse().join('');
    
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
export const subscriptions: SubscriptionData[] = sortByDateDesc(allSubscriptions);

// Define featured subscriptions (first 5 subscriptions)
export const featuredSubscriptions: SubscriptionData[] = subscriptions.slice(0, 5);

// All other subscriptions are regular
export const regularSubscriptions: SubscriptionData[] = subscriptions.slice(5);
