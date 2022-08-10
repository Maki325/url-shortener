import styles from '../../styles/Links.module.css';
import type {NextPage, NextPageContext} from 'next';
import {Route as RouteType} from '@prisma/client';
import Link from 'next/link';
import Route from '../../components/Route';

export const getServerSideProps = async (context: NextPageContext) => {
  const res = await fetch(`http://localhost:3000/api/links`);
  const {routes}: {routes: RouteType[]} = await res.json();

  let route = null;
  let slug = context.query.slug as string[];
  if (slug && slug.length > 0) {
    const id = parseInt(slug[0]);
    route = routes.filter((route) => route.id === id)[0];
  }

  return {props: {routes: routes, route}};
};

type Props = {
  routes: RouteType[];
  route: RouteType | null;
};

const Routes: NextPage<Props> = ({routes, route}: Props) => {
  const generateList = () => {
    let items = [];
    for (let i = 0; i < routes.length; i++) {
      const {id, from} = routes[i];
      items.push(
        <Link href={`${id}`}>
          <li
            key={id}
            className={route && route.id == id ? styles.selected : undefined}>
            {from}
          </li>
        </Link>,
      );
    }
    // for (let i = 0; i < 30; i++) {
    //   items.push(
    //     <li key={`test-${i}`}>{i} TestTestTestTestTestTestTestTest</li>,
    //   );
    // }
    return items;
  };
  return (
    <div className={styles.links}>
      <ul className={styles.sidebar}>{generateList()}</ul>
      <Route route={route} />
    </div>
  );
};

export default Routes;
