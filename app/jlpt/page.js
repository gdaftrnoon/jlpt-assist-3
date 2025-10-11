import { readFile } from 'fs/promises';
import path from 'path';

export default async function Page() {
  const filePath = path.join(process.cwd(), 'public', 'vocab', 'n5', 'n5_page33_v1.json');
  const json = await readFile(filePath, 'utf-8');
  const data = JSON.parse(json);

  console.log(data);

  return <h1>poop</h1>;
}