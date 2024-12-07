export const userIndex = (req, res) => {
  const user = req.currentUser;
  res.render('user/index', { user });
};

export const userPurchase = (req, res) => {
  const user = req.currentUser;
  res.render('user/purchase', { user });
};

export const userPurchaseHistory = (req, res) => {
  const user = req.currentUser;
  res.render('user/purchase-history', { user });
};

export const userData = (req, res) => {
  const user = req.currentUser;
  res.render('user/data', { user });
};

export const userSettings = (req, res) => {
  const user = req.currentUser;
  res.render('user/setting', { user });
};
