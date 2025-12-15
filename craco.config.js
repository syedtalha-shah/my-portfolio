module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Modify source-map-loader to ignore @react-three packages
      const rules = webpackConfig.module.rules;
      
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        
        // Check if this is a source-map-loader rule
        if (rule.enforce === 'pre') {
          if (rule.use && Array.isArray(rule.use)) {
            const sourceMapLoader = rule.use.find(
              (use) => use.loader && use.loader.includes('source-map-loader')
            );
            if (sourceMapLoader) {
              // Exclude @react-three packages
              rule.exclude = rule.exclude 
                ? Array.isArray(rule.exclude) 
                  ? [...rule.exclude, /node_modules\/@react-three\//]
                  : [rule.exclude, /node_modules\/@react-three\//]
                : /node_modules\/@react-three\//;
            }
          } else if (rule.loader && rule.loader.includes('source-map-loader')) {
            // Handle direct loader property
            rule.exclude = rule.exclude 
              ? Array.isArray(rule.exclude) 
                ? [...rule.exclude, /node_modules\/@react-three\//]
                : [rule.exclude, /node_modules\/@react-three\//]
              : /node_modules\/@react-three\//;
          }
        }
      }

      return webpackConfig;
    },
  },
};
