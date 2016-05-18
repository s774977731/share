module.exports = {
  path: 'share',
  getComponent(location, cb) {
    require.ensure([], (require) => {
      cb(null, require('./components/Share'));
    });
  }
};
