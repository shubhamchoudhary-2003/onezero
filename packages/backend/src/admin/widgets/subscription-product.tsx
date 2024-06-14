import React, { useState } from 'react';
import { ProductDetailsWidgetProps, WidgetConfig } from "@medusajs/admin"
import  { useAdminProduct,useAdminUpdateProduct } from "medusa-react"
import {Checkbox} from "@medusajs/ui"
import { Check } from 'typeorm';

const SubscriptionProductCheckBox=({ product, notify}:  ProductDetailsWidgetProps) => {

  
  const [isSubscribed, setIsSubscribable] = useState<boolean>(product.metadata.isSubscribable as boolean ?? false);
  const {mutate,isLoading}     = useAdminUpdateProduct(product.id);
    const handleSubscriptionChange = async () => {
    // Toggle the local state
    const newStatus =!isSubscribed;
    setIsSubscribable(newStatus);

    // Update the product in the backend
    try {
        
       mutate({
        metadata: {
          ...product.metadata,
          subscription: isSubscribed,
        },
       },{
            onSuccess: () => {
            notify.success("Subscription Status","Product subscription status updated successfully")
            },
            onError: () => {
            notify.error("Subscription Status","Failed to update product subscription status")
            }
        
       })

        
      
    } catch (error) {
      
    }
  };

  return (
    <div>
      
      <label>
        Subscribe:
        <Checkbox
          checked={isSubscribed}
          onChange={handleSubscriptionChange}
        />
      </label>
      <p>Current Subscription Status: {isSubscribed? "Subscribed" : "Not Subscribed"}</p>
    </div>
  );
}


export const config: WidgetConfig = {
    zone: "product.details.after",
  }
  
  
export default SubscriptionProductCheckBox;
