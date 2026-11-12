export interface DataSchema {
  data: {
    genres: Record<string, string>;
    languages: Record<string, string>;
    cities: Record<string, string>;
    serverErrors: Record<string, string>;
  };
}
