import React from "react";
import { Route, Routes } from 'react-router-dom';
import Trade from '../pages/Trade/Trade';
import Scan from '../pages/Scan/Scan';
import Portfolio from '../pages/Portfolio/Portfolio';
import Home from '../pages/Home/Home';
import Create from '../pages/Create/Create';
import Swap from '../pages/Swap/Swap';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* <Route path="/" element={<Home />} /> */}
      {/* <Route path="/trade" element={<Trade />} /> */}
      <Route path="/" element={<Scan />} />
      <Route path="/sagara" element={<Scan />} />
      {/* <Route path="/create" element={<Create />} />
      <Route path="/swap" element={<Swap />} />
      <Route path="/portfolio" element={<Portfolio />} /> */}
    </Routes>
  )
};

export default AppRoutes;
