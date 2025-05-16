
import React from "react";
import SubscriptionCard from "@/components/SubscriptionCard";

interface SubscriptionItemProps {
  id?: string;
  title: string;
  price: string;
  paymentMethod: string;
  status: string;
  access: string;
  headerColor: string;
  priceColor: string;
  whatsappNumber: string;
  telegramUsername: string;
  icon?: string;
  addedDate?: string;
  subscriptionRefs?: React.MutableRefObject<{[key: string]: HTMLDivElement | null}>;
  isSearchResult?: boolean;
  isMemberSubmission?: boolean;
  featured?: boolean;
  isAdminSubmission?: boolean;
}

const SubscriptionItem: React.FC<SubscriptionItemProps> = ({
  id,
  title,
  price,
  paymentMethod,
  status,
  access,
  headerColor,
  priceColor,
  whatsappNumber,
  telegramUsername,
  icon,
  addedDate,
  subscriptionRefs,
  isSearchResult = false,
  isMemberSubmission = false,
  featured = false,
  isAdminSubmission = false
}) => {
  console.log(`Rendering subscription: ${title}, isMemberSubmission: ${isMemberSubmission}, featured: ${featured}, isAdminSubmission: ${isAdminSubmission}`);

  // If the subscription needs to be referenced (for featured items), use a ref
  if (subscriptionRefs) {
    return (
      <div ref={el => subscriptionRefs.current[title] = el}>
        <SubscriptionCard
          id={id}
          title={title}
          price={price}
          paymentMethod={paymentMethod}
          status={status}
          access={access}
          headerColor={headerColor}
          priceColor={priceColor}
          whatsappNumber={whatsappNumber}
          telegramUsername={telegramUsername}
          icon={icon}
          addedDate={addedDate}
          isSearchResult={isSearchResult}
          isMemberSubmission={isMemberSubmission}
          featured={featured}
          isAdminSubmission={isAdminSubmission}
        />
      </div>
    );
  }
  
  // Otherwise, render without a ref
  return (
    <SubscriptionCard
      id={id}
      title={title}
      price={price}
      paymentMethod={paymentMethod}
      status={status}
      access={access}
      headerColor={headerColor}
      priceColor={priceColor}
      whatsappNumber={whatsappNumber}
      telegramUsername={telegramUsername}
      icon={icon}
      addedDate={addedDate}
      isSearchResult={isSearchResult}
      isMemberSubmission={isMemberSubmission}
      featured={featured}
      isAdminSubmission={isAdminSubmission}
    />
  );
};

export default SubscriptionItem;
