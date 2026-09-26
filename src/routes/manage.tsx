import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Pencil, Plus, Trash2, LogOut, ArrowLeft } from 'lucide-react';

type Table = 'menu_categories'|'menu_items'|'gallery_images'|'reviews'|'contact_messages';
const config: Record<Table, {label:string, fields: string[]}> = {
  menu_categories: { label:'Menu categories', fields:['name','slug','description','sort_order','is_active'] },
  menu_items: { label:'Menu items', fields:['name','slug','category_id','description','price','image_url','sort_order','is_featured','is_active'] },
  gallery_images: { label:'Gallery', fields:['title','category','image_url','alt_text','sort_order','is_active'] },
  reviews: { label:'Reviews', fields:['customer_name','rating','review_text','source','review_date','is_featured','is_active'] },
  contact_messages: { label:'Messages', fields:['name','email','phone','message','status','created_at'] },
};
const tables = Object.keys(config) as Table[];
type RecordRow = Record<string, unknown> & {id:string};
export const Route = createFileRoute('/manage')({
  head: () => ({ meta: [
    { title: 'Content Management | Usk Bar & Grill' },
    { name: 'description', content: 'Manage Usk Bar & Grill menu, gallery, reviews, and messages.' },
    { property: 'og:title', content: 'Content Management | Usk Bar & Grill' },
    { property: 'og:description', content: 'Staff content management for Usk Bar & Grill.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }), component: Manage,
});
function Manage() {
  const navigate = useNavigate();
  const [access,setAccess] = useState<'loading'|'admin'|'denied'>('loading');
  const [table,setTable] = useState<Table>('menu_items');
  const [rows,setRows] = useState<RecordRow[]>([]);
  const [categories,setCategories] = useState<{id:string,name:string}[]>([]);
  const [editing,setEditing] = useState<RecordRow|null>(null);
  const [creating,setCreating] = useState(false);
  const [error,setError] = useState('');
  useEffect(() => { supabase.auth.getUser().then(async ({data}) => { if (!data.user) {navigate({to:'/staff'});return;} const {data: role} = await supabase.rpc('has_role',{_user_id:data.user.id,_role:'admin'});setAccess(role?'admin':'denied'); }); },[navigate]);
  useEffect(() => { if(access!=='admin')return; void load(table); },[access,table]);
  async function load(t:Table) {
    const result = await supabase.from(t).select('*').order('created_at',{ascending:false});
    if(result.error)setError(result.error.message); else setRows(result.data as RecordRow[]);
    const cats = await supabase.from('menu_categories').select('id,name').order('sort_order');setCategories(cats.data??[]);
  }
  async function save(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();setError('');const fd=new FormData(e.currentTarget);const values:Record<string,string|number|boolean|null>={};
    for(const field of config[table].fields) { if(field==='created_at')continue; const raw=fd.get(field); values[field]= ['is_active','is_featured'].includes(field) ? raw==='on' : ['price','rating','sort_order'].includes(field) ? (raw===''?null:Number(raw)) : raw===''?null:String(raw??''); }
    let result;
    if(editing) result = await supabase.from(table).update(values as never).eq('id',editing.id);
    else result = await supabase.from(table).insert(values as never);
    if(result.error){setError(result.error.message);return;}setEditing(null);setCreating(false);await load(table);
  }
  async function remove(id:string) { if(!window.confirm('Delete this entry?'))return;const {error}=await supabase.from(table).delete().eq('id',id);if(error)setError(error.message);else await load(table); }
  async function setStatus(id:string,status:string) { const {error}=await supabase.from('contact_messages').update({status}).eq('id',id);if(error)setError(error.message);else await load(table); }
  if(access==='loading') return <main className="section-wrap py-20">Checking access…</main>;
  if(access==='denied') return <main className="section-wrap flex min-h-screen flex-col items-start justify-center gap-5"><h1 className="display-title text-4xl">Staff access required.</h1><p className="max-w-md text-muted-foreground">Your account is signed in, but the restaurant owner has not granted it management access.</p><Button asChild variant="heroOutline"><Link to="/">Return to website</Link></Button><Button variant="ghost" onClick={async()=>{await supabase.auth.signOut();navigate({to:'/staff'});}}>Sign out</Button></main>;
  return <main className="min-h-screen"><header className="border-b border-border bg-surface"><div className="section-wrap flex flex-wrap items-center justify-between gap-4 py-5"><div><Link to="/" className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary"><ArrowLeft size={14}/> Website</Link><h1 className="display-title mt-2 text-3xl">Content management</h1></div><Button variant="outline" onClick={async()=>{await supabase.auth.signOut();navigate({to:'/staff'});}}><LogOut/> Sign out</Button></div></header><div className="section-wrap py-8"><div className="flex flex-wrap gap-2">{tables.map(t=><Button key={t} variant={table===t?'hero':'outline'} onClick={()=>{setTable(t);setEditing(null);setCreating(false);setError('');}}>{config[t].label}</Button>)}</div><div className="mt-10 flex items-center justify-between gap-4"><h2 className="display-title text-3xl">{config[table].label}</h2>{table!=='contact_messages' && <Button variant="hero" onClick={()=>{setEditing(null);setCreating(true);}}><Plus/> Add new</Button>}</div>{error && <p role="alert" className="mt-5 text-primary">{error}</p>}
  {(editing||creating) && <form onSubmit={save} className="mt-6 grid gap-4 border border-border bg-card p-6 sm:grid-cols-2"><h3 className="display-title col-span-full text-2xl">{editing?'Edit entry':'New entry'}</h3>{config[table].fields.filter(f=>f!=='created_at').map(field => <label key={field} className="block text-sm capitalize">{field.replaceAll('_',' ')}{field==='category_id'?<select name={field} defaultValue={String(editing?.[field]??'')} className="mt-2 w-full border border-border bg-background px-3 py-3"><option value="">Choose category</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>:['is_active','is_featured'].includes(field)?<input name={field} type="checkbox" defaultChecked={editing ? Boolean(editing[field]) : field==='is_active'} className="ml-3 accent-primary"/>:field==='description'||field==='review_text'||field==='message'?<textarea name={field} defaultValue={String(editing?.[field]??'')} rows={4} className="mt-2 w-full border border-border bg-background px-3 py-3"/>:<input name={field} type={['price','rating','sort_order'].includes(field)?'number':field==='review_date'?'date':'text'} step={field==='price'?'0.01':undefined} defaultValue={String(editing?.[field]??'')} className="mt-2 w-full border border-border bg-background px-3 py-3"/>}</label>)}<div className="col-span-full flex gap-3"><Button variant="hero" type="submit">Save</Button><Button variant="outline" type="button" onClick={()=>{setEditing(null);setCreating(false);}}>Cancel</Button></div></form>}
  <div className="mt-6 space-y-3">{rows.length===0 && <p className="py-12 text-muted-foreground">No entries yet.</p>}{rows.map(row=><article key={row.id} className="flex flex-wrap items-start justify-between gap-4 border border-border bg-card p-5"><div className="min-w-0 flex-1"><h3 className="font-display text-xl font-bold">{String(row.name??row.title??row.customer_name??row.email??'Entry')}</h3><p className="mt-1 break-words text-sm text-muted-foreground">{String(row.description??row.review_text??row.message??row.slug??row.category??'')}</p>{row.price!=null && <p className="mt-2 text-sm text-primary">${String(row.price)}</p>}{row.status!=null && <p className="mt-2 text-xs uppercase text-primary">{String(row.status)}</p>}</div><div className="flex gap-2">{table==='contact_messages'?<select aria-label="Message status" value={String(row.status)} onChange={e=>setStatus(row.id,e.target.value)} className="border border-border bg-background px-2 py-1 text-sm">{['New','Read','Replied','Archived'].map(s=><option key={s}>{s}</option>)}</select>:<><Button variant="outline" size="icon" aria-label="Edit entry" onClick={()=>{setEditing(row);setCreating(false);}}><Pencil/></Button><Button variant="outline" size="icon" aria-label="Delete entry" onClick={()=>remove(row.id)}><Trash2/></Button></>}</div></article>)}</div></div></main>;
}
