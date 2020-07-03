import axios from 'axios';
import * as core from '@actions/core';

async function main(): Promise<void> {
  const repository = core.getInput('repository');
  const branchName = core.getInput('branchName');
  const prRef = core.getInput('pr');
  const apiKey = core.getInput('backlogApiKey');
  const prUrl = `https://github.com/${repository}/pull/${prRef.match(/[0-9]+/)?.toString()}`;

  const backlogNo = branchName.match(/YD-[0-9]+/i)?.toString().toUpperCase();
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
    const res = await backlogApi.patch(url, data, { params: { apiKey }});
    console.log(res);
  } catch(e) {
    console.log(e);
  }
}

main()