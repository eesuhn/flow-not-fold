import DisplayAllUser from '@/components/DisplayAllUser';
import DisplayUser from '@/components/DisplayUser';
// import WalletConnection from '@/components/WalletConnection';

export default function Home() {
  // return <DisplayUser />;
  // return <WalletConnection />;
  return (
    <>
      <DisplayUser />
      <DisplayAllUser />
    </>
  );
}
