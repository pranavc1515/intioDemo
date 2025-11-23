/**
 * Email API Integration
 * Handles all form submissions and sends them to the email API
 */

(function($) {
  'use strict';

  // Email API endpoint
  const EMAIL_API_URL = 'https://email-sender-rho-two.vercel.app/api/send-email';
  
  // Recipient email (you can change this to your business email)
  const RECIPIENT_EMAIL = 'Interiorsintio@gmail.com';

  /**
   * Format form data into email API format
   */
  function formatEmailData(form) {
    const formData = {};
    
    // Get all form fields
    $(form).find('input, select, textarea').each(function() {
      const $field = $(this);
      const name = $field.attr('name');
      const type = $field.attr('type');
      
      // Skip submit buttons and checkboxes (unless checked)
      if (type === 'submit' || type === 'button') {
        return;
      }
      
      if (type === 'checkbox') {
        if ($field.is(':checked')) {
          formData[name] = $field.val() || 'Yes';
        }
      } else {
        const value = $field.val();
        if (value) {
          formData[name] = value;
        }
      }
    });

    // Get email from form (required by API)
    const email = formData.email || formData['popup_email'] || '';
    
    // Build subject based on form type
    let subject = 'New Contact Form Submission';
    if (formData.subject) {
      subject = formData.subject;
    } else if (formData.inquiry_type) {
      subject = `New Quote Request - ${formData.inquiry_type}`;
    } else if (formData.budget) {
      subject = 'New Quote Request';
    }

    // Build email body (plain text)
    let body = '';
    if (formData.name || formData['popup_name']) {
      body += `Name: ${formData.name || formData['popup_name']}\n`;
    }
    if (email) body += `Email: ${email}\n`;
    if (formData.phone || formData.number || formData['popup_phone']) {
      body += `Phone: ${formData.phone || formData.number || formData['popup_phone']}\n`;
    }
    if (formData.budget || formData['popup_budget']) {
      body += `Budget: ${formData.budget || formData['popup_budget']}\n`;
    }
    if (formData.inquiry_type || formData['popup_inquiry_type']) {
      body += `Inquiry Type: ${formData.inquiry_type || formData['popup_inquiry_type']}\n`;
    }
    if (formData.message) {
      body += `\nMessage:\n${formData.message}`;
    }

    // Build HTML email body
    let html = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">';
    html += '<h2 style="color: #ff833b; border-bottom: 2px solid #ff833b; padding-bottom: 10px;">New Contact Form Submission</h2>';
    html += '<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">';
    
    if (formData.name || formData['popup_name']) {
      const name = formData.name || formData['popup_name'];
      html += `<tr><td style="padding: 8px 0; font-weight: bold; width: 150px;">Name:</td><td style="padding: 8px 0;">${escapeHtml(name)}</td></tr>`;
    }
    if (email) {
      html += `<tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${email}">${escapeHtml(email)}</a></td></tr>`;
    }
    if (formData.phone || formData.number || formData['popup_phone']) {
      const phone = formData.phone || formData.number || formData['popup_phone'];
      html += `<tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td style="padding: 8px 0;"><a href="tel:${phone}">${escapeHtml(phone)}</a></td></tr>`;
    }
    if (formData.budget || formData['popup_budget']) {
      html += `<tr><td style="padding: 8px 0; font-weight: bold;">Budget:</td><td style="padding: 8px 0;">${escapeHtml(formData.budget || formData['popup_budget'])}</td></tr>`;
    }
    if (formData.inquiry_type || formData['popup_inquiry_type']) {
      html += `<tr><td style="padding: 8px 0; font-weight: bold;">Inquiry Type:</td><td style="padding: 8px 0;">${escapeHtml(formData.inquiry_type || formData['popup_inquiry_type'])}</td></tr>`;
    }
    if (formData.subject) {
      html += `<tr><td style="padding: 8px 0; font-weight: bold;">Subject:</td><td style="padding: 8px 0;">${escapeHtml(formData.subject)}</td></tr>`;
    }
    if (formData.message) {
      html += `<tr><td colspan="2" style="padding: 8px 0; font-weight: bold; padding-top: 15px;">Message:</td></tr>`;
      html += `<tr><td colspan="2" style="padding: 8px 0; padding-top: 5px; white-space: pre-wrap;">${escapeHtml(formData.message).replace(/\n/g, '<br>')}</td></tr>`;
    }
    
    html += '</table>';
    html += '<p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #6c6d71; font-size: 12px;">This email was sent from the INTIO Interiors website contact form.</p>';
    html += '</div>';

    return {
      to: RECIPIENT_EMAIL,
      subject: subject,
      body: body.trim(),
      html: html
    };
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  /**
   * Validate form fields
   */
  function validateForm(form) {
    let isValid = true;
    const $form = $(form);

    // Remove previous validation classes
    $form.find('.is-invalid').removeClass('is-invalid');

    // Validate required fields
    const requiredFields = ['name', 'email'];
    requiredFields.forEach(function(fieldName) {
      const $field = $form.find('[name="' + fieldName + '"], [name="popup_' + fieldName + '"]');
      if ($field.length && !$field.val()) {
        $field.addClass('is-invalid');
        isValid = false;
      }
    });
    
    // Also check if name field exists (either name or popup_name)
    const $nameField = $form.find('[name="name"], [name="popup_name"]');
    if ($nameField.length && !$nameField.val()) {
      $nameField.addClass('is-invalid');
      isValid = false;
    }

    // Validate email format
    const $emailField = $form.find('[name="email"], [name="popup_email"]');
    if ($emailField.length) {
      const email = $emailField.val();
      const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
      if (!email || !emailRegex.test(email)) {
        $emailField.addClass('is-invalid');
        isValid = false;
      }
    }

    return isValid;
  }

  /**
   * Handle form submission
   */
  function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const $form = $(form);
    const $messageContainer = $form.find('.form-messages');
    
    // Validate form
    if (!validateForm(form)) {
      if ($messageContainer.length) {
        $messageContainer.removeClass('success').addClass('error');
        $messageContainer.text('Please fill in all required fields correctly.');
      }
      return false;
    }

    // Get submit button and disable it
    const $submitBtn = $form.find('button[type="submit"], input[type="submit"]');
    const originalBtnText = $submitBtn.text() || $submitBtn.val();
    $submitBtn.prop('disabled', true);
    if ($submitBtn.is('button')) {
      $submitBtn.data('original-text', originalBtnText);
      $submitBtn.text('Sending...');
    }

    // Format email data
    const emailData = formatEmailData(form);

    // Send email via API
    $.ajax({
      url: EMAIL_API_URL,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(emailData),
      success: function(response) {
        if (response.success) {
          // Success
          if ($messageContainer.length) {
            $messageContainer.removeClass('error').addClass('success');
            $messageContainer.text('Thank you! Your message has been sent successfully.');
          }
          
          // Reset form
          $form[0].reset();
          $form.find('.is-invalid').removeClass('is-invalid');
          
          // Close popup if it's a popup form
          if ($form.closest('.quote-popup-modal').length) {
            setTimeout(function() {
              if (typeof closeQuotePopup === 'function') {
                closeQuotePopup();
              }
            }, 2000);
          }
        } else {
          throw new Error(response.message || 'Failed to send email');
        }
      },
      error: function(xhr, status, error) {
        let errorMessage = 'Oops! An error occurred and your message could not be sent.';
        
        if (xhr.responseJSON && xhr.responseJSON.message) {
          errorMessage = xhr.responseJSON.message;
        } else if (xhr.responseText) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.message) {
              errorMessage = response.message;
            }
          } catch (e) {
            // Use default error message
          }
        }

        if ($messageContainer.length) {
          $messageContainer.removeClass('success').addClass('error');
          $messageContainer.text(errorMessage);
        }
      },
      complete: function() {
        // Re-enable submit button
        $submitBtn.prop('disabled', false);
        if ($submitBtn.is('button')) {
          $submitBtn.text($submitBtn.data('original-text') || originalBtnText);
        }
      }
    });

    return false;
  }

  /**
   * Initialize email integration
   */
  function initEmailIntegration() {
    // Remove old form handlers and add new ones
    $(document).off('submit', '.ajax-contact');
    $(document).on('submit', '.ajax-contact', handleFormSubmit);
    
    // Also handle quote form specifically if it exists
    const $quoteForm = $('#quoteForm');
    if ($quoteForm.length) {
      $quoteForm.off('submit');
      $quoteForm.on('submit', handleFormSubmit);
    }
  }

  // Initialize when DOM is ready
  $(document).ready(function() {
    initEmailIntegration();
  });

  // Also initialize after page load (in case forms are added dynamically)
  $(window).on('load', function() {
    initEmailIntegration();
  });

})(jQuery);

