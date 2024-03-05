import { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import nftAbi from "../constants/BasicNft.json"
import Image from "next/image"
import { Card, useNotification } from "web3uikit"
import { ethers } from "ethers"
import UpdateListingModal from "./UpdateListingModal"

const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr

    const separator = "..."
    const seperatorLength = separator.length
    const charsToShow = strLen - seperatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)
    return (
        fullStr.substring(0, frontChars) +
        separator +
        fullStr.substring(fullStr.length - backChars)
    )
}

export default function NFTBox({
    price,
    nftAddress,
    tokenId,
    marketplaceAddress,
    seller,
}) {
    const { isWeb3Enabled, account } = useMoralis()
    const [imageURI, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")
    const [showModal, setShowModal] = useState(false)
    const hideModal = () => setShowModal(false)
    const dispatch = useNotification()

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId,
        },
    })

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "buyItem",
        msgValue: price,
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
    })

    async function updateUI() {
        const tokenURI = await getTokenURI()
        console.log(`The TokenURI is ${tokenURI}`)
        // We are going to cheat a little here...
        if (tokenURI) {
            // IPFS Gateway: A server that will return IPFS files from a "normal" URL.
            const requestURL = tokenURI.replace(
                "ipfs://",
                "https://ipfs.io/ipfs/",
            )
            const tokenURIResponse = await (await fetch(requestURL)).json()
            const imageURI = tokenURIResponse.image
            const imageURIURL = imageURI.replace(
                "ipfs://",
                "https://ipfs.io/ipfs/",
            )
            setImageURI(imageURIURL)
            setTokenName(tokenURIResponse.name)
            setTokenDescription(tokenURIResponse.description)
            // We could render the Image on our sever, and just call our sever.
            // For testnets & mainnet -> use moralis server hooks
            // Have the world adopt IPFS
            // Build our own IPFS gateway
        }
        // get the tokenURI
        // using the image tag from the tokenURI, get the image
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const isOwnedByUser = seller === account || seller === undefined
    const formattedSellerAddress = isOwnedByUser
        ? "you"
        : truncateStr(seller || "", 15)

    const handleCardClick = () => {
        isOwnedByUser
            ? setShowModal(true)
            : buyItem({
                  onError: (error) => console.log(error),
                  onSuccess: handleBuyItemSuccess,
              })
    }

    const handleBuyItemSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Item bought!",
            title: "Item Bought",
            position: "topR",
        })
    }

    return (
        <div>
            <div>
                {imageURI ? (
                    <div>
                        <UpdateListingModal
                            isVisible={showModal}
                            tokenId={tokenId}
                            marketplaceAddress={marketplaceAddress}
                            nftAddress={nftAddress}
                            onClose={hideModal}
                        />
                        <Card
                            title={tokenName}
                            description={tokenDescription}
                            onClick={handleCardClick}
                        >
                            <div className="p-2">
                                <div className="flex flex-col items-end gap-2">
                                    <div>#{tokenId}</div>
                                    <div className="italic text-sm">
                                        Owned by {formattedSellerAddress}
                                    </div>
                                    <Image
                                        loader={() => imageURI}
                                        src={imageURI}
                                        height="200"
                                        width="200"
                                    />
                                    <div className="font-bold">
                                        {ethers.utils.formatUnits(
                                            price,
                                            "ether",
                                        )}{" "}
                                        ETH
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div>Loading...</div>
                )}
            </div>
        </div>
    )
}

// import { useState, useEffect } from "react"
// import { useWeb3Contract, useMoralis } from "react-moralis"
// import nftMarketplaceAbi from "../constants/NftMarketplace.json"
// import nftAbi from "../constants/BasicNft.json"
// import Image from "next/image"
// import { Card, useNotification } from "web3uikit"
// import { ethers } from "ethers"
// import UpdateListingModal from "./UpdateListingModal"

// const truncateStr = (fullStr, strLen) => {
//     if (fullStr.length <= strLen) return fullStr

//     const separator = "..."
//     const seperatorLength = separator.length
//     const charsToShow = strLen - seperatorLength
//     const frontChars = Math.ceil(charsToShow / 2)
//     const backChars = Math.floor(charsToShow / 2)
//     return (
//         fullStr.substring(0, frontChars) +
//         separator +
//         fullStr.substring(fullStr.length - backChars)
//     )
// }

// export default function NFTBox({
//     price,
//     nftAddress,
//     tokenId,
//     marketplaceAddress,
//     seller,
// }) {
//     const { isWeb3Enabled, account } = useMoralis()
//     const [imageURI, setImageURI] = useState("")
//     const [tokenName, setTokenName] = useState("")
//     const [tokenDescription, setTokenDescription] = useState("")
//     const [showModal, setShowModal] = useState(false)
//     const hideModal = () => setShowModal(false)
//     const dispatch = useNotification()
//     console.log(`NFT address: ${nftAddress}`)
//     const { runContractFunction: getTokenURI } = useWeb3Contract({
//         abi: nftAbi,
//         contractAddress: nftAddress,
//         functionName: "tokenURI",
//         params: {
//             tokenId: tokenId,
//         },
//     })

//     const { runContractFunction: buyItem } = useWeb3Contract({
//         abi: nftMarketplaceAbi,
//         contractAddress: marketplaceAddress,
//         functionName: "buyItem",
//         msgValue: price,
//         params: {
//             nftAddress: nftAddress,
//             tokenId: tokenId,
//         },
//     })

//     async function updateUI() {
//         const tokenURI = await getTokenURI()
//         console.log(`The TokenURI is ${tokenURI}`)
//         // We are going to cheat a little here...
//         if (tokenURI) {
//             // IPFS Gateway: A server that will return IPFS files from a "normal" URL.
//             const requestURL = tokenURI.replace(
//                 "ipfs://",
//                 "https://ipfs.io/ipfs/",
//             )
//             const tokenURIResponse = await (await fetch(requestURL)).json()
//             const imageURI = tokenURIResponse.image
//             const imageURIURL = imageURI.replace(
//                 "ipfs://",
//                 "https://ipfs.io/ipfs/",
//             )
//             setImageURI(imageURIURL)
//             setTokenName(tokenURIResponse.name)
//             setTokenDescription(tokenURIResponse.description)
//             // We could render the Image on our sever, and just call our sever.
//             // For testnets & mainnet -> use moralis server hooks
//             // Have the world adopt IPFS
//             // Build our own IPFS gateway
//         }
//         // get the tokenURI
//         // using the image tag from the tokenURI, get the image
//     }

//     useEffect(() => {
//         if (isWeb3Enabled) {
//             updateUI()
//         }
//     }, [isWeb3Enabled])

//     const isOwnedByUser = seller === account || seller === undefined
//     const formattedSellerAddress = isOwnedByUser
//         ? "you"
//         : truncateStr(seller || "", 15)

//     const handleCardClick = () => {
//         isOwnedByUser
//             ? setShowModal(true)
//             : buyItem({
//                   onError: (error) => console.log(error),
//                   onSuccess: () => handleBuyItemSuccess(),
//               })
//     }

//     const handleBuyItemSuccess = () => {
//         dispatch({
//             type: "success",
//             message: "Item bought!",
//             title: "Item Bought",
//             position: "topR",
//         })
//     }

//     return (
//         <div>
//             <div>
//                 {
//                     // imageURI ?
//                     <div>
//                         <UpdateListingModal
//                             isVisible={showModal}
//                             tokenId={tokenId}
//                             marketplaceAddress={marketplaceAddress}
//                             nftAddress={nftAddress}
//                             onClose={hideModal}
//                         />
//                         <Card
//                             title={tokenName}
//                             description={tokenDescription}
//                             onClick={handleCardClick}
//                         >
//                             <div className="p-2">
//                                 <div className="flex flex-col items-end gap-2">
//                                     <div>#{tokenId}</div>
//                                     <div className="italic text-sm">
//                                         Owned by {formattedSellerAddress}
//                                     </div>
//                                     <Image
//                                         loader={() => imageURI}
//                                         src={imageURI}
//                                         height="200"
//                                         width="200"
//                                     />
//                                     <div className="font-bold">
//                                         {ethers.utils.formatUnits(
//                                             price,
//                                             "ether",
//                                         )}{" "}
//                                         ETH
//                                     </div>
//                                 </div>
//                             </div>
//                         </Card>
//                     </div>
//                     // : (
//                     //     <div>Loasding...</div>
//                     // )
//                 }
//             </div>
//         </div>
//     )
// }

// // import { useState, useEffect } from "react"
// // import { ethers } from "ethers"
// // // import { marketAddress } from "../constants/BasicNft.json"
// // import NFTMarketplace from "../constants/NftMarketplace.json"
// // import Web3Modal from "web3modal"
// // import axios from "axios"
// // const marketAddress = "0x009f6979167aa29e541e31852f7fcdf0a1ab0218"
// // export default function MyNfts() {
// //     const [nft, setNft] = useState([])
// //     const [loading, setLoading] = useState(true)

// //     useEffect(() => {
// //         loadNFTs()
// //     }, [])
// //     async function loadNFTs() {
// //         const provider = new ethers.providers.Web3Provider(window.ethereum)
// //         const signer = provider.getSigner()
// //         const contract = new ethers.Contract(
// //             marketAddress,
// //             NFTMarketplace.abi,
// //             signer,
// //         )
// //         const data = await contract.fetchMyNft()

// //         const items = await Promise.all(
// //             data.map(async (i) => {
// //                 const tokenUri = await contract.tokenURI(i.tokenId)
// //                 const meta = await axios.get(tokenUri, {
// //                     headers: {
// //                         Accept: "application/json",
// //                     },
// //                 })
// //                 let price = ethers.utils.formatUnits(
// //                     i.price.toString(),
// //                     "ether",
// //                 )
// //                 let item = {
// //                     price,
// //                     tokenId: i.tokenId.toNumber(),
// //                     seller: i.seller,
// //                     owner: i.owner,
// //                     name: meta.data.name,
// //                     image: meta.data.image,
// //                 }
// //                 return item
// //             }),
// //         )
// //         setNft(items)
// //         setLoading(false)
// //     }
// //     async function resellNft(tokenId, tokenPrice) {
// //         setLoading(true)
// //         const provider = new ethers.providers.Web3Provider(window.ethereum)
// //         const signer = provider.getSigner()
// //         const contract = new ethers.Contract(
// //             marketAddress,
// //             NFTMarketplace.abi,
// //             signer,
// //         )
// //         const price = ethers.utils.parseUnits(tokenPrice, "ether")
// //         let listingPrice = await contract.getListingPrice()
// //         listingPrice = listingPrice.toString()
// //         const tx = await contract.resellToken(tokenId, listingPrice, {
// //             value: listingPrice,
// //         })
// //         await tx.wait()
// //         loadNFTs()
// //         setLoading(false)
// //     }
// //     if (loading)
// //         return <h1 className="px-20 py-10 text-3xl">Wait Loading . . .</h1>
// //     if (!nft.length && loading == false)
// //         return (
// //             <h1 className="px-20 py-10 text-3xl">No NFTS Owned By You . . .</h1>
// //         )

// //     return (
// //         <div className="flex justify-center">
// //             <div className="px-4" style={{ maxWidth: "1600px" }}>
// //                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
// //                     {nft.map((nft, i) => (
// //                         <div
// //                             key={i}
// //                             className="border shadow rounded-xl overflow-hidden"
// //                         >
// //                             <img
// //                                 src={nft.image}
// //                                 alt={nft.name}
// //                                 height={200}
// //                                 width={300}
// //                                 className="object-cover"
// //                             />
// //                             <div className="p-4">
// //                                 <p
// //                                     style={{ maxHeight: "60px" }}
// //                                     className="text-2xl font-semibold truncate"
// //                                 >
// //                                     {nft.name}
// //                                 </p>
// //                                 <div className="max-h-40 overflow-hidden">
// //                                     <p className="text-gray-400">
// //                                         {nft.description}
// //                                     </p>
// //                                 </div>
// //                             </div>

// //                             <div className="p-4 bg-white">
// //                                 <p className="text-2xl mb-4 font-bold text-black">
// //                                     {nft.price} ETH
// //                                 </p>
// //                                 <button
// //                                     className="w-full bg-black text-white font-bold py-2 px-4 rounded-md shadow-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
// //                                     onClick={() =>
// //                                         resellNft(nft.tokenId, nft.price)
// //                                     }
// //                                 >
// //                                     Resell NFT
// //                                 </button>
// //                             </div>
// //                         </div>
// //                     ))}
// //                 </div>
// //             </div>
// //         </div>
// //     )
// // }
