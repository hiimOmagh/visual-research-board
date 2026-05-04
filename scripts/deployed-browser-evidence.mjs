import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const root = process.cwd();
const baseUrl = (process.env.VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const requireRuntime = ["1","true","yes","on"].includes(String(process.env.VISUAL_RESEARCH_BOARD_REQUIRE_NEXT_RUNTIME || "").toLowerCase());
async function fetchText(path, init) { const startedAt=Date.now(); try { const response=await fetch(`${baseUrl}${path}`, init); const text=await response.text(); return {ok:response.ok,status:response.status,duration_ms:Date.now()-startedAt,content_type:response.headers.get("content-type")||"",text}; } catch(error){ return {ok:false,status:0,duration_ms:Date.now()-startedAt,content_type:"",text:"",error:error instanceof Error?error.message:"Unknown fetch failure."}; } }
function parseJson(response){ try{return response.text?JSON.parse(response.text):null;}catch{return null;} }
function hasAppShell(html){ const lowered=html.toLowerCase(); return lowered.includes("visual research board") || lowered.includes("__next") || lowered.includes("source-aware"); }
const homepage=await fetchText("/");
const providerRuntime=await fetchText("/api/provider-runtime");
const searchPayload={topic:"Carthage documentary visual references",mode:"youtube_documentary",depth:"standard",provider_toggles:{mock:true,wikimedia:true,brave:true,tavily:true}};
const search=await fetchText("/api/search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(searchPayload)});
const runtimeJson=parseJson(providerRuntime); const searchJson=parseJson(search);
const homepageLooksLikeApp=homepage.ok && hasAppShell(homepage.text);
const apiRuntimeAvailable=providerRuntime.ok && Boolean(runtimeJson?.providers || runtimeJson?.runtime);
const searchAvailable=search.ok && Array.isArray(searchJson?.results);
const staticDemoDetected=homepageLooksLikeApp && (!apiRuntimeAvailable || !searchAvailable);
const nextRuntimeDetected=homepageLooksLikeApp && apiRuntimeAvailable && searchAvailable;
const deploymentSurface=nextRuntimeDetected?"next_runtime":staticDemoDetected?"static_demo":"unknown_or_broken";
const checks=[
  {id:"homepage_loads",passed:homepage.ok,detail:`HTTP ${homepage.status}`},
  {id:"homepage_contains_app_shell",passed:homepageLooksLikeApp,detail:"Looks for Visual Research Board / source-aware / Next shell markers."},
  {id:"provider_runtime_endpoint",passed:apiRuntimeAvailable || staticDemoDetected,detail:apiRuntimeAvailable?"Runtime endpoint available.":"API unavailable; acceptable only for static demo evidence."},
  {id:"search_endpoint",passed:searchAvailable || staticDemoDetected,detail:searchAvailable?"Search endpoint available.":"API unavailable; acceptable only for static demo evidence."},
  {id:"runtime_surface_classified",passed:deploymentSurface!=="unknown_or_broken",detail:deploymentSurface}
];
const summary={generated_at:new Date().toISOString(),base_url:baseUrl,app_version:runtimeJson?.runtime?.app_version || runtimeJson?.app_version || "0.2.9",deployment_surface:deploymentSurface,require_next_runtime:requireRuntime,passed:checks.every((check)=>check.passed)&&(!requireRuntime || deploymentSurface==="next_runtime"),checks,homepage:{status:homepage.status,duration_ms:homepage.duration_ms,content_type:homepage.content_type,error:homepage.error,title_hint:(homepage.text.match(/<title>(.*?)<\/title>/i)?.[1] || "").slice(0,120)},provider_runtime:{status:providerRuntime.status,duration_ms:providerRuntime.duration_ms,content_type:providerRuntime.content_type,parsed:runtimeJson},search_smoke:{request:searchPayload,status:search.status,duration_ms:search.duration_ms,result_count:Array.isArray(searchJson?.results)?searchJson.results.length:0,retrieval_evidence:searchJson?.diagnostics?.retrieval_evidence,quality_calibration:searchJson?.diagnostics?.quality_calibration,auto_tuning:searchJson?.diagnostics?.auto_tuning,evidence_tuning:searchJson?.diagnostics?.evidence_tuning},manual_browser_steps_required:["Open the deployed URL in a normal browser.","Create a project and run a standard mock search.","Save a result, edit a note, assign a section, and refresh the page to verify persistence.","Open export preview and export JSON/Markdown/template output.","If using Next runtime, run real-provider checks after adding provider keys."]};
mkdirSync(join(root,"artifacts"),{recursive:true}); const outPath=join(root,"artifacts/deployed-browser-evidence.json"); writeFileSync(outPath,`${JSON.stringify(summary,null,2)}\n`); console.log(`Deployed browser evidence written to ${outPath}`); console.log(`Base URL: ${baseUrl}`); console.log(`Surface: ${summary.deployment_surface}`); console.log(`Passed: ${summary.passed?"yes":"no"}`); if(!summary.passed) process.exit(1);
