import { useParams } from "react-router-dom";

const UserProfile = () => {
  const params = useParams();

  console.log(params);

  return (
    <section className="h-cover">
      <div>UserProfile</div>
    </section>
  );
};

export default UserProfile;
