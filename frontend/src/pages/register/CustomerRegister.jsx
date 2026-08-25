import PageShell from '../../components/form/PageShell';
import CustomerRegisterForm from './CustomerRegisterForm';

function CustomerRegister() {
  return (
    <PageShell title="Customer Registration" description="Create your customer account." notice="Start your Qurbani journey with a trusted account.">
      <CustomerRegisterForm />
    </PageShell>
  );
}

export default CustomerRegister;
