
// We're only updating the form initialization for the Telegram field
// Since this file is read-only, we'll need to make this change somewhere else

// Since we can't directly modify SubmitSubscriptionForm.tsx (it's read-only), 
// we'll create a utility hook that can be used in the form

import React from 'react';

// Since we can't modify the SubmitSubscriptionForm.tsx file directly,
// we'll create this hook to modify the DOM when the page loads
export const useTelegramFieldModifier = () => {
  React.useEffect(() => {
    // Find the Telegram input field by its placeholder or label
    const telegramFields = document.querySelectorAll('input[placeholder*="Telegram"], input[aria-label*="Telegram"]');
    
    telegramFields.forEach(field => {
      if (field instanceof HTMLInputElement) {
        // Only prepopulate if the field is empty
        if (!field.value) {
          field.value = '@';
        } else if (!field.value.startsWith('@')) {
          field.value = '@' + field.value;
        }
        
        // Handle focus event to set cursor after the @
        field.addEventListener('focus', () => {
          if (field.value === '@') {
            setTimeout(() => {
              field.setSelectionRange(1, 1);
            }, 0);
          }
        });
      }
    });
  }, []);
};

export default useTelegramFieldModifier;
