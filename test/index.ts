import { expect } from "chai";
import { ethers } from "hardhat";
import {base64} from "ethers/lib/utils";
import {rapNames} from "../rapNames";
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised')

describe("RapNameNFT", () => {
  before(() => {
    chai.use(chaiAsPromised);
  });
  it("Should make a new RapNameNFT", async () => {
    const RapNameNFT = await ethers.getContractFactory("RapNameNFT");
    const rapNameNFT = await RapNameNFT.deploy();
    await rapNameNFT.deployed();

    const setRapNameTx = await rapNameNFT.setRapName(1, "Wild Turkey");

    await setRapNameTx.wait();

    expect(await rapNameNFT.name()).to.equal("RapNameNFT");
    expect(await rapNameNFT.symbol()).to.equal( "RNFT");
    expect(await rapNameNFT.getRapName(1)).to.equal("Wild Turkey");

    (await rapNameNFT.mint(1, { value: ethers.utils.parseEther("0.02") })).wait();

    const tokenURI = await rapNameNFT.tokenURI(1);
    const appBase64 = tokenURI.replace("data:application/json;base64,", "");
    const json = JSON.parse(new TextDecoder().decode(base64.decode(appBase64)));
    expect(json.name).to.equal("RapNameNFT #1");
    expect(json.description).to.equal("You're Welcome");
    const svgImage = json.image;
    const svgBase64 =  svgImage.replace("data:image/svg+xml;base64,", "");
    const svg = new TextDecoder().decode(base64.decode(svgBase64));
    expect(svg).to.contain(">Wild Turkey</text>");
  });

  it("Should not allow renaming a RapNameNFT", async () => {
    const RapNameNFT = await ethers.getContractFactory("RapNameNFT");
    const rapNameNFT = await RapNameNFT.deploy();
    await rapNameNFT.deployed();
    expect(await rapNameNFT.getCurrentTokenId()).to.equal(1);
    await rapNameNFT.setRapName(1, "Wild Turkey");
    await expect(rapNameNFT.setRapName(1, "Apple Bees")).eventually.to.rejectedWith(/Already set rap name/);

    (await rapNameNFT.mint(1, { value: ethers.utils.parseEther("0.02") })).wait();
    expect(await rapNameNFT.getCurrentTokenId()).to.equal(2);
    expect(await rapNameNFT.getRapName(1)).to.equal("Wild Turkey");
  });

  it("Should allow transfer of NFT", async () => {
    const RapNameNFT = await ethers.getContractFactory("RapNameNFT");
    const rapNameNFT = await RapNameNFT.deploy();
    await rapNameNFT.deployed();
    const [owner, addr1] = await ethers.getSigners();
    expect(0).to.equal((await rapNameNFT.walletOfOwner(owner.address)).length);
    await (await rapNameNFT.setRapName(1, "Wild Turkey")).wait();
    (await rapNameNFT.mint(1, { value: ethers.utils.parseEther("0.02") })).wait();
    const wallet = await rapNameNFT.walletOfOwner(owner.address);
    expect(1).to.equal(wallet.length);
    expect(1).to.equal(wallet[0]);
    expect(0).to.equal((await rapNameNFT.walletOfOwner(addr1.address)).length);
    await rapNameNFT.transferFrom(owner.address, addr1.address, wallet[0]);
    expect(1).to.equal((await rapNameNFT.walletOfOwner(addr1.address)).length);
    expect(0).to.equal((await rapNameNFT.walletOfOwner(owner.address)).length);
    await expect(rapNameNFT.transferFrom(addr1.address, owner.address, wallet[0])).eventually.to.rejectedWith(/not owner/);
  });

  it("Should allow us to set all the names from rapNames JS", async () => {
    const RapNameNFT = await ethers.getContractFactory("RapNameNFT");
    const rapNameNFT = await RapNameNFT.deploy();
    await rapNameNFT.deployed();
    const [owner] = await ethers.getSigners();
    await (await rapNameNFT.setRapNames(rapNames)).wait();
    (await rapNameNFT.mint(10, { value: ethers.utils.parseEther("0.20") })).wait();
    expect(10).to.equal((await rapNameNFT.walletOfOwner(owner.address)).length);
  });
});
