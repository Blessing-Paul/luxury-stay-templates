// Frontend-only forms: validation and honest demo feedback, no network submissions.
(function(){
 function setup(formId, feedbackId, validMessage){
  const form=document.getElementById(formId);if(!form)return;
  const feedback=document.getElementById(feedbackId);
  form.addEventListener('submit',function(e){
   e.preventDefault();feedback.hidden=false;
   const invalid=[...form.querySelectorAll('input,select,textarea')].find(el=>!el.checkValidity());
   if(invalid){feedback.className='form-feedback error';feedback.textContent=invalid.validity.valueMissing?'Please complete all required fields.':invalid.validity.typeMismatch?'Please enter a valid email address.':invalid.validity.patternMismatch?'Please enter a valid phone number.':'Please check the highlighted field and try again.';invalid.focus();invalid.reportValidity();return;}
   feedback.className='form-feedback success';feedback.textContent=validMessage;
  });
 }
 setup('contact-form','contact-feedback','Your enquiry is valid and ready to send. This is a demonstration website, so no message has been submitted.');
 setup('login-form','login-feedback','Your details are valid. Sign-in is not available in this frontend demonstration; no credentials were transmitted.');
 setup('reset-form','reset-feedback','Your email address is valid. This is a demonstration; no password reset email has been sent.');
})();
