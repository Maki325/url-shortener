import React from 'react'
import Navbar from './Navbar'

type Props = {
  children: any | any[];
}

export default function Layout({ children }: Props) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}