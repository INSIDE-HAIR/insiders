import { auth, signOut } from "@/auth";
const SettingPage = async () => {
  const session = await auth().catch(() => null);

  return (
    <div>
      {JSON.stringify(session)}
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button type="submit">Sign Out</button>
      </form>
    </div>
  );
};

export default SettingPage;
