import styles from '../styles/Navbar.module.css';
import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <>
      <div className={styles.navbar}>
        <h1 className={styles['navbar-name']}>
          <Link href="/">URL Shortener</Link>
        </h1>
        <h2>
          <Link href="/links">Links</Link>
        </h2>
      </div>
      <div className={styles['navbar-nonsticky']}></div>
    </>
  );
}
