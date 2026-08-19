import RoleRegistrationForm from './RoleRegistrationForm';

function CustomerRegisterForm(props) {
  return (
    <RoleRegistrationForm
      {...props}
      role="Customer"
      loginPath="/login/customer"
      successTitle="Registration successful"
      successMessage="Your customer registration has been submitted. We will notify you once it is ready."
    />
  );
}

export default CustomerRegisterForm;
