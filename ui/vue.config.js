module.exports = {
    chainWebpack: config => {
        config
            .plugin('html')
            .tap(args => {
                args[0].title = 'Mini-Python Parser';
                return args;
            });
    },
    publicPath: './'
};
