import React from "react";
import ClanMembers from "./components/ClanMembers";
import ClanWarData from "./components/ClanWarData";
import Home from "./components/Home";
import Nav from "./components/Nav";
import { Route, Routes } from "react-router-dom";
import "./styles.css";
import "./reset.css";
import Header from "./components/Header";
import MainWrapper from "./components/MainWrapper";
import Footer from "./components/Footer";

const App = () => {
  return (
    <>
      <MainWrapper>
        <Header />
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/clan-war-info" element={<ClanWarData />} />
          <Route path="/clan-members" element={<ClanMembers />} />
        </Routes>
        <Footer />
      </MainWrapper>
    </>
  );
};

export default App;
