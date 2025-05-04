
import { SubscriptionData } from "@/types/subscriptionTypes";
import { streamingSubscriptions } from "./streamingSubscriptions";
import { educationSubscriptions } from "./educationSubscriptions";
import { musicSubscriptions } from "./musicSubscriptions";
import { youtubeSubscriptions } from "./youtubeSubscriptions";
import { productivitySubscriptions } from "./productivitySubscriptions";

// Combine all subscriptions into one array
export const subscriptions: SubscriptionData[] = [
  ...streamingSubscriptions,
  ...educationSubscriptions,
  ...musicSubscriptions,
  ...youtubeSubscriptions,
  ...productivitySubscriptions
];

// Define featured subscriptions (first 5 subscriptions)
export const featuredSubscriptions: SubscriptionData[] = subscriptions.slice(0, 5);

// All other subscriptions are regular
export const regularSubscriptions: SubscriptionData[] = subscriptions.slice(5);
