import {expect} from "chai";
import {ethers} from "hardhat";
import {base64} from "ethers/lib/utils";
import { rapNames } from "../rapNames"

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised')

describe("RapNameNFTv2", () => {
  before(() => {
    chai.use(chaiAsPromised);
  });
  const checkName = async (rapNameNFT: any, tokenId: any, ownerId: any, name: any) => {
    let tokenURI = await rapNameNFT.tokenURI(tokenId);
    let appBase64 = tokenURI.replace("data:application/json;base64,", "");
    let json = JSON.parse(new TextDecoder().decode(base64.decode(appBase64)));
    expect(json.name).to.equal(name);
    // expect(json.image).to.equal("");
    expect(await rapNameNFT.ownerOf(tokenId)).to.equal(ownerId);
  }

  it("Should make a new RapNameNFT", async () => {
    const RapNameNFT = await ethers.getContractFactory("RapNameNFTv2");
    const rapNameNFT = await RapNameNFT.deploy();
    await rapNameNFT.deployed();
    await rapNameNFT.setRapNames(rapNames);
    await rapNameNFT.ownerClaim();

    expect(await rapNameNFT.name()).to.equal("RapNameNFT");
    expect(await rapNameNFT.symbol()).to.equal( "RNFT");
    await checkName(rapNameNFT, 1, '0x984C74D1eb9942736cA899fC33a3476bDa9BDBce', "Dorky Shill");
    await checkName(rapNameNFT, 2, '0x984C74D1eb9942736cA899fC33a3476bDa9BDBce', "A Tribe Called Tokenomics");
    await checkName(rapNameNFT, 3, '0x236BC95dd51B2C658701bf195699C8f30142CD42', "Hans Diamond");
    await checkName(rapNameNFT, 4, '0xB191271baaC4f10Bec72FB89e62528B6dE68508d', "50 Sats");
  });

  it("Should allow minting a new RapNameNFT", async () => {
    const [owner] = await ethers.getSigners();
    const RapNameNFT = await ethers.getContractFactory("RapNameNFTv2");
    const rapNameNFT = await RapNameNFT.deploy();
    await rapNameNFT.deployed();
    await rapNameNFT.setRapNames(rapNames);
    await rapNameNFT.ownerClaim();

    expect(await rapNameNFT.getCurrentTokenId()).to.equal(5);
    (await rapNameNFT.mint(1, { value: ethers.utils.parseEther("0.02") })).wait();
    expect(await rapNameNFT.getCurrentTokenId()).to.equal(6);
    await checkName(rapNameNFT, 5, owner.address, "Childish Bitcoin");
  });

  it("Should allow transfer of NFT", async () => {
    const RapNameNFT = await ethers.getContractFactory("RapNameNFTv2");
    const rapNameNFT = await RapNameNFT.deploy();
    await rapNameNFT.deployed();
    await rapNameNFT.setRapNames(rapNames);
    await rapNameNFT.ownerClaim();

    const [owner, addr1] = await ethers.getSigners();
    expect(0).to.equal((await rapNameNFT.walletOfOwner(owner.address)).length);
    (await rapNameNFT.mint(1, { value: ethers.utils.parseEther("0.02") })).wait();
    const wallet = await rapNameNFT.walletOfOwner(owner.address);
    expect(1).to.equal(wallet.length);
    expect(5).to.equal(wallet[0]);
    expect(0).to.equal((await rapNameNFT.walletOfOwner(addr1.address)).length);
    await rapNameNFT.transferFrom(owner.address, addr1.address, wallet[0]);
    expect(1).to.equal((await rapNameNFT.walletOfOwner(addr1.address)).length);
    expect(0).to.equal((await rapNameNFT.walletOfOwner(owner.address)).length);
    await expect(rapNameNFT.transferFrom(addr1.address, owner.address, wallet[0])).eventually.to.rejectedWith(/not owner/);
  });

  it("Should make sure we can only mint 256", async () => {
    const RapNameNFT = await ethers.getContractFactory("RapNameNFTv2");
    const rapNameNFT = await RapNameNFT.deploy();
    await rapNameNFT.deployed();
    await rapNameNFT.setRapNames(rapNames);
    await rapNameNFT.ownerClaim();

    expect(await rapNameNFT.estimateGas.mint(10)).to.equal(1627040);

    for (let i = 0; i < 25; i++) {
      (await rapNameNFT.mint(10)).wait();
    }
    expect(await rapNameNFT.estimateGas.mint(1)).to.equal(162704);
    (await rapNameNFT.mint(2)).wait();

    await expect( rapNameNFT.mint(1)).to.eventually.rejectedWith(/Sale has ended/);
  });

  it("Should make sure gas fees are reasonable", async () => {
    const RapNameNFT = await ethers.getContractFactory("RapNameNFTv2");
    const rapNameNFT = await RapNameNFT.deploy();
    expect(await rapNameNFT.estimateGas.setRapNames(rapNames)).to.equal(6396947);
    expect(await rapNameNFT.estimateGas.ownerClaim()).to.equal(525017);

  });
});
