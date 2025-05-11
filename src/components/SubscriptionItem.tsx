
import React from "react";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useNavigate } from "react-router-dom";

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
  isAdmin?: boolean;
  isUserSubmission?: boolean;
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
  isAdmin = false,
  isUserSubmission = false
}) => {
  const navigate = useNavigate();
  
  // Função para navegar para página de edição
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (id) {
      if (isUserSubmission) {
        navigate(`/admin/subscriptions/edit/${id}?source=pending`);
      } else {
        navigate(`/admin/subscriptions/edit/${id}`);
      }
    }
  };
  
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
          isAdmin={isAdmin}
          isUserSubmission={isUserSubmission}
          onEditClick={handleEditClick}
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
      isAdmin={isAdmin}
      isUserSubmission={isUserSubmission}
      onEditClick={handleEditClick}
    />
  );
};

export default SubscriptionItem;
