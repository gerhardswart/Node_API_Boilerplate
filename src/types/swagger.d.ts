declare module 'swagger-ui-express' {
  const swaggerUi: {
    serve: any;
    setup: (spec: any) => any;
    generateHTML: (spec: any) => string;
  };
  export default swaggerUi;
}

declare module 'yamljs' {
  const YAML: {
    load: (filePath: string) => any;
  };
  export default YAML;
}
