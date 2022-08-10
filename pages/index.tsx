import styles from '../styles/Home.module.css';
import type {NextPage} from 'next';

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <h1 style={{fontSize: 70}}>
        Welcome to the <b>BEST</b> URL tracker <b>EVER</b>!
      </h1>
    </div>
  );
};

export default Home;
