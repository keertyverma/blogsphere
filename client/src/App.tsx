import { logo } from "./assets/images";

const App = () => {
  return (
    <>
      <div>
        <h1 className="text-3xl font-palanquin">
          How to setup tailwind in vite projects
        </h1>
        <p className="text-xl font-inter">
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Exercitationem quo expedita nostrum doloribus? Doloribus, animi.
        </p>
      </div>
      <img src={logo} width={100} height={100} alt="logo" />
    </>
  );
};

export default App;
