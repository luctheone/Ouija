import Exa from 'exa-js';

let _client: InstanceType<typeof Exa> | null = null;

function getExa() {
  if (!_client) {
    _client = new Exa(process.env.EXA_API_KEY!);
  }
  return _client;
}

export async function retrieveDocs(site: string, task: string) {
  const results = await getExa().searchAndContents(
    `${site} ${task} setup guide`,
    {
      type: 'auto',
      numResults: 5,
      text: { maxCharacters: 10000, includeHtmlTags: false },
    }
  );

  return results.results.map((r) => ({
    title: r.title,
    url: r.url,
    text: r.text,
  }));
}
