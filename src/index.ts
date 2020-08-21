import axios from 'axios';
import * as core from '@actions/core';

async function main(): Promise<void> {
  const repository = core.getInput('repository');
  const branchName = core.getInput('branchName');

  if (branchName.match(/YD-[0-9]+-#[0-9]+/i) !== null) {
    console.log('this branch is not for backlog issue');
    return;
  }

  const backlogNo = branchName.match(/YD-[0-9]+/i)?.toString().toUpperCase();

  const prRef = core.getInput('pr');
  const apiKey = core.getInput('backlogApiKey');
  const prUrl = `https://github.com/${repository}/pull/${prRef.match(/[0-9]+/)?.toString()}`;

  const branchAttrId = core.getInput('backlogBranchAttributeId');
  const prUrlAttrId = core.getInput('backlogPrUrlAttributeId');
  const backlogEndpoint = core.getInput('backlogEndpoint');

  const backlogApi = axios.create({
    baseURL: backlogEndpoint,
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  });

  const data = `customField_${branchAttrId}=${branchName}&customField_${prUrlAttrId}=${prUrl}`;
  const url = `/issues/${backlogNo}`;

  try {
    const res = await backlogApi.get(url, { params: { apiKey }});
    console.log((res.data.customFields as any[]).map((f) => f.id));
    const existBranchName = (res.data.customFields as any[]).filter((f) => f.id === branchAttrId)[0].value  as string | null;
    const existPrUrl = (res.data.customFields as any[]).filter((f) => f.id === prUrlAttrId)[0].value as string | null;

    // アップデートがない場合はapiを叩かない
    if (branchName === existBranchName && prUrl === existPrUrl) return;
  } catch (e) {
    console.error(e)
    return;
  }

  try {
    const res = await backlogApi.patch(url, data, { params: { apiKey }});
    console.log(res);
  } catch(e) {
    console.error(e);
    return;
  }
}

main()