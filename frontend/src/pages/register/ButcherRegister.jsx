import PageShell from '../../components/form/PageShell';
import ButcherRegisterForm from './ButcherRegisterForm';

function ButcherRegister() {
  return (
    <PageShell
      title="Butcher Registration"
      description="Apply as a verified butcher."
      notice="Registration is subject to administrator verification before the account becomes active."
      hideHomeButton
      hideLogo
    >
      <ButcherRegisterForm />
    </PageShell>
  );
}

export default ButcherRegister;
