import { useEffect, useState } from 'react';
import { BlueprintMetadata } from '../../hooks/hooks';
import styles from './BlueprintStatusTracker.module.css';
import DomainDropdown from '../../shared/DomainDropdown';
import { inProgressStatus, queuedStatus, sentStatus, shoppingCart, waitTime } from '../../consts/images';


type BlueprintStatusTrackerProps = {
    blueprints: BlueprintMetadata[];
    isMobile: boolean;
};

export default function BlueprintStatusTracker({
    blueprints,
    isMobile,
}: BlueprintStatusTrackerProps) {
    const [selectedBlueprint, setSelectedBlueprint] = useState<BlueprintMetadata>();
    useEffect(() => {
        if (!blueprints || blueprints.length === 0) return;
        setSelectedBlueprint(blueprints[0]);
    }, [blueprints]);

    function getBpDisplayName(bp: BlueprintMetadata) {
        return `${bp.teamName} - ${bp.blueprintId}`;
    }

    function getStatusImageUrl(bp: BlueprintMetadata) {
        switch (bp.deliveryStatus) {
            case 'Published':
                return sentStatus;
            case 'Queued':
                return queuedStatus;
            case 'InProgress':
                return inProgressStatus;
            default:
                return '';
        }
    }

    function getDeliveryStatusString(bp: BlueprintMetadata) {
        switch (bp.deliveryStatus) {
            case 'Published':
                return 'Sent';
            case 'Queued':
                return 'Queued';
            case 'InProgress':
                return 'In Progress';
            default:
                return '';
        }
    }
    function getDeliveryStatusColor (bp: BlueprintMetadata) {
        switch (bp.deliveryStatus) {
            case 'Published':
                return '#1AE069';
            case 'Queued':
                return '#FF4200';
            case 'InProgress':
                return '#00B1FF';
            default:
                return '';
        }
    }
    if (isMobile) {
        return (
            <div className={styles.blueprintStatusTrackerMobile}>
                <div className={styles.title} style={{fontSize: '30px'}}>
                    Blueprint Status Tracker
                </div>
                <DomainDropdown
                    renderValue={(value) => {
                        const bp = blueprints.find(
                            (bp) => getBpDisplayName(bp) === value
                        );
                        return bp ? bp.teamName : '';
                    }}
                    options={blueprints.map(
                        (bp) => getBpDisplayName(bp)
                    )}
                    value={
                        selectedBlueprint
                            ? getBpDisplayName(selectedBlueprint)
                            : ''
                    }
                    onChange={(e) => {
                        const {
                            target: { value },
                        } = e;
                        setSelectedBlueprint(
                            blueprints.find(
                                (bp) => getBpDisplayName(bp) === value
                            )
                        );
                    }}
                />
                {selectedBlueprint && (
                    <>
                        <img
                            className={styles.statusImageMobile}
                            src={getStatusImageUrl(selectedBlueprint)}
                            alt="Status"
                        />
                        <div
                            className={styles.mobileDeliveryStatus}
                            style={{color: getDeliveryStatusColor(selectedBlueprint)}}
                        >
                            {getDeliveryStatusString(selectedBlueprint)}
                        </div>
                        <div className={styles.lastUpdated} style={{alignSelf: 'center'}}>
                            {`Last Updated: ${formatUpdatedDate(selectedBlueprint.updatedUtc)}`}
                        </div>
                        <div className={styles.waitTimeLabelMobile}>Current wait time:</div>
                        <div className={styles.waitTimeMobile}>7-10 days</div>
                        <div className={styles.mobileButtonRow}>
                            <div className={styles.buttonContainerMobile}>
                                <button
                                    className={styles.buyABlueprintButtonMobile}
                                    onClick={() => 
                                        window.open('https://bit.ly/domainbp', '_blank', 'noopener,noreferrer')
                                    }
                                >
                                    <img src={shoppingCart} className={styles.shoppingCart} />
                                </button>
                                <div className={styles.buttonLabelMobile}>Buy a BP</div>
                            </div>
                            <div className={styles.buttonContainerMobile}>
                                <button
                                    className={styles.openTicketMobile}
                                    onClick={() => 
                                        window.open(' https://discord.gg/6hcUy6Hrcu', '_blank', 'noopener,noreferrer')
                                    }
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="81" height="80" viewBox="0 0 81 80" fill="none">
                                        <path opacity="0.75" d="M59.2011 39.8058C59.2011 29.5855 50.7787 21.2999 40.3895 21.2999C30.0004 21.2999 21.5779 29.5855 21.5779 39.8058C21.5779 50.0262 30.0004 58.3118 40.3895 58.3118C50.7787 58.3118 59.2011 50.0262 59.2011 39.8058ZM80.8634 33.9942L80.7806 45.6263L71.1564 47.9403C70.5676 50.5758 69.4472 53.0971 68.0618 55.4141L73.1201 63.6952C73.0764 63.953 72.9108 64.1426 72.7722 64.353C72.1337 65.3233 66.7652 70.5513 65.7066 71.3423C65.1509 71.7571 64.7067 72.2075 63.9763 71.7794L56.2963 66.984C53.9697 68.3602 51.4368 69.4846 48.7442 69.9883L46.392 79.4576L34.5211 79.4561L32.2351 70.3024C31.958 69.9454 28.8544 69.1024 28.0954 68.8002C26.7808 68.2758 25.1228 66.8522 23.7856 67.3514L16.744 71.8416L15.7321 71.8475L7.79299 63.6952L12.8031 55.6244C11.5276 53.1016 10.219 50.5728 9.57145 47.7966L0 45.4486L0.04668 33.7394L9.53982 31.5469C10.5759 29.0537 11.2641 26.4004 12.8407 24.1561L7.93756 16.3964L7.86076 15.4675C9.38924 14.475 14.7864 7.94189 15.9128 7.6382C16.2094 7.55672 16.476 7.57302 16.741 7.73598L24.6138 12.5891C26.9555 11.2262 29.52 10.2337 32.1553 9.57442C32.4941 9.24554 33.6205 2.22508 34.0859 0.955505C34.253 0.496262 34.3268 0.0488739 34.9171 -1.52588e-05L46.398 0.111092L48.5725 9.37444C51.1567 10.3314 53.7679 11.1492 56.1502 12.5536L64.5636 7.59821L65.178 7.72709L73.1442 15.6379L68.0723 23.9872C69.2379 26.5189 70.5224 28.9677 71.2347 31.6817L80.8634 33.9942Z" fill="white"/>
                                    </svg>
                                </button>
                                <div className={styles.buttonLabelMobile}>Open Ticket</div>
                            </div>
                        </div>
                        <div className={styles.mobileButtonRow}>
                            <div className={styles.buttonContainerMobile}>
                                <button
                                    className={styles.discordButtonMobile}
                                    onClick={() => 
                                        window.open('https://discord.gg/wfCHv9gjmd', '_blank', 'noopener,noreferrer')
                                    }
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="67" viewBox="0 0 96 67" fill="none">
                                        <path opacity="0.75" d="M61.6598 29.7609C56.0886 30.2454 53.1458 36.1097 54.5065 41.0274C56.2475 47.3243 64.1383 49.5582 68.6346 44.3826C73.4612 38.8281 69.6095 29.0687 61.6598 29.7609ZM31.7501 29.7609C25.6342 30.3319 22.7611 37.3002 25.1217 42.3719C28.0305 48.6255 36.5981 48.9508 39.8373 42.7924C42.8961 36.9766 38.9409 29.0878 31.7501 29.7609ZM34.9017 7.62939e-06C34.9464 0.240532 35.8124 0.944794 35.666 1.11091C29.7608 2.7565 23.9753 5.03023 18.7666 8.20029C17.3541 9.06203 15.9559 9.9774 14.7078 11.0485C17.4844 9.73688 20.2719 8.46677 23.1789 7.43546C34.491 3.41578 48.1317 2.30315 59.9938 4.41076C66.8239 5.62376 73.4219 7.89748 79.536 11.0502C79.6378 11.0122 79.4467 10.898 79.4146 10.872C78.3485 10.0155 77.1093 9.17969 75.9433 8.45293C70.9809 5.35554 65.3972 3.09047 59.7634 1.40854C59.6563 1.26838 60.7973 0.202461 60.9098 7.62939e-06H61.292L64.4561 0.308014C70.7202 1.16283 77.645 3.97816 82.7663 7.54794C83.9859 8.39756 84.0948 8.62597 84.7662 9.91165C91.0214 21.8928 95.4658 38.5858 95.6373 52.0257C95.6391 52.1503 95.5891 52.3545 95.7158 52.4324V54.7303C90.9767 61.5134 82.7555 65.4864 74.4772 66.5125L72.3077 66.7444H70.5488L65.1954 60.3299C66.0507 59.9942 66.9489 59.7727 67.8132 59.4577C71.9863 57.9437 76.4682 55.2754 79.2664 51.8735C79.3432 51.7818 79.8556 51.1502 79.8039 51.0965C76.0415 53.4758 71.9113 55.2754 67.681 56.7341C55.5154 60.932 42.7015 60.8888 30.4072 57.1979C25.5092 55.727 20.7486 53.7613 16.4666 51.0221C16.3952 51.1 17.1595 52.0102 17.2684 52.1365C20.1076 55.4398 24.3342 57.9506 28.4573 59.4577C28.7412 59.5616 30.5144 60.0738 30.5412 60.1828L25.111 66.7444H23.3503L21.1825 66.5125C13.9828 65.6144 6.70801 62.4461 1.89388 57.1044C1.22783 56.369 0.661782 55.5557 0.0189459 54.8047C0.0671587 53.5 -0.0417664 52.178 0.0189459 50.875C0.62964 38.1757 4.1331 24.8241 9.41507 13.2253C9.95255 12.0452 11.0686 9.33716 11.8114 8.42698C12.1203 8.04802 13.6578 7.09804 14.1613 6.77619C20.0112 3.0351 27.3984 0.306282 34.4428 7.62939e-06H34.9017Z" fill="white"/>
                                    </svg>
                                </button>
                                <div className={styles.buttonLabelMobile}>Discord</div>
                            </div>
                            <div className={styles.buttonContainerMobile}>
                                <button
                                    className={styles.faqButtonMobile}
                                    // onClick={() => 
                                    //     window.open('https://bit.ly/domainbp', '_blank', 'noopener,noreferrer')
                                    // }
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="65" viewBox="0 0 35 65" fill="none">
                                        <path opacity="0.75" d="M28.6967 0L34.1881 5.28797V30.2779L28.6967 35.5658H21.1683L19.8397 36.8452L19.0426 43.4978H9.91986L8.76845 30.3632L14.3484 25.0752H21.6997L22.9397 23.7959V11.77L21.6997 10.5759H12.6655L11.337 11.77V18.3373H0V5.28797L5.49135 0H28.6967ZM10.4513 49.8092H18.2455L22.1425 53.562V61.0675L18.2455 64.8202H10.4513L6.55419 61.0675V53.562L10.4513 49.8092Z" fill="white"/>
                                    </svg>
                                </button>
                                <div className={styles.buttonLabelMobile}>FAQ</div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }
    
    return (
        <div className={styles.blueprintStatusTracker}>
            <div className={styles.title}>
                Blueprint Status Tracker
            </div>
            <DomainDropdown
                renderValue={(value) => {
                    const bp = blueprints.find(
                        (bp) => getBpDisplayName(bp) === value
                    );
                    return bp ? bp.teamName : '';
                }}
                options={blueprints.map(
                    (bp) => getBpDisplayName(bp)
                )}
                value={
                    selectedBlueprint
                        ? getBpDisplayName(selectedBlueprint)
                        : ''
                }
                onChange={(e) => {
                    const {
                        target: { value },
                    } = e;
                    setSelectedBlueprint(
                        blueprints.find(
                            (bp) => getBpDisplayName(bp) === value
                        )
                    );
                }}
            />
            {selectedBlueprint && (
                <>
                    <img
                        className={styles.statusImage}
                        src={getStatusImageUrl(selectedBlueprint)}
                        alt="Status"
                    />
                    <div className={styles.lastUpdated}>
                        {`Last Updated: ${formatUpdatedDate(selectedBlueprint.updatedUtc)}`}
                    </div>
                    <div className={styles.currentStatus}>
                        Current status:{' '}
                        <span className={styles.deliveryStatus} style={{color: getDeliveryStatusColor(selectedBlueprint)}}>
                            {getDeliveryStatusString(selectedBlueprint)}
                        </span>
                    </div>
                </>
            )}
            <div className={styles.cardContainer}>
                <button
                    className={styles.buyABlueprint}
                    onClick={() => 
                        window.open('https://bit.ly/domainbp', '_blank', 'noopener,noreferrer')
                    }
                >
                    <HalfCart />
                    <div className={styles.buyABlueprintText}>Buy a Blueprint</div>
                </button>
                {selectedBlueprint && (
                    <div className={styles.currentWaitTime}>
                        <img src={waitTime} style={{height: '90%', width: 'auto'}} />
                        <div className={styles.waitTimeText}>
                            <div className={styles.waitTimeTextTitle}>Current Wait Time:</div>
                            <div className={styles.waitTimeTextValue}>7-10 days</div>
                        </div>
                    </div>
                )}
            </div>
            <div className={styles.buttonContainer}>
                <button
                    className={styles.submitTicket}
                    onClick={() => 
                        window.open('https://discord.gg/6hcUy6Hrcu', '_blank', 'noopener,noreferrer')
                    }
                >
                    <Gear />
                    <div className={styles.submitTicketText}>Submit a Ticket</div>
                </button>
                <button
                    className={styles.dynastyCommunity}
                    onClick={() => 
                        window.open('https://discord.gg/wfCHv9gjmd', '_blank', 'noopener,noreferrer')
                    }
                >
                    <Discord />
                    <div className={styles.dynastyCommunityText}>Dynasty Community</div>
                </button>
            </div>
        </div>
    );
}

const formatUpdatedDate = (isoString?: string): string => {
    if (!isoString) return 'unknown';
    const date = new Date(isoString);

    return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
    });
};

function Gear() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="57" height="57" viewBox="0 0 57 57" fill="none" style={{height: '90%', width: 'auto'}}>
            <path d="M41.7304 28.5553C41.7304 21.2236 35.7935 15.2798 28.4703 15.2798C21.147 15.2798 15.2101 21.2236 15.2101 28.5553C15.2101 35.887 21.147 41.8307 28.4703 41.8307C35.7935 41.8307 41.7304 35.887 41.7304 28.5553ZM57 24.3862L56.9416 32.7307L50.1576 34.3907C49.7426 36.2812 48.9528 38.09 47.9763 39.7521L51.5418 45.6927C51.511 45.8776 51.3943 46.0136 51.2966 46.1645C50.8465 46.8606 47.0623 50.6109 46.3161 51.1784C45.9244 51.476 45.6113 51.7991 45.0964 51.4919L39.6828 48.0519C38.0428 49.0392 36.2574 49.8458 34.3594 50.2071L32.7014 57L24.3336 56.9989L22.7223 50.4324C22.527 50.1763 20.3392 49.5716 19.8043 49.3548C18.8776 48.9786 17.7089 47.9573 16.7663 48.3155L11.8027 51.5366L11.0894 51.5408L5.49322 45.6927L9.0248 39.903C8.12572 38.0932 7.20328 36.2791 6.74684 34.2876L0 32.6032L0.0329044 24.2034L6.72455 22.6306C7.45486 20.842 7.93996 18.9387 9.05134 17.3287L5.59512 11.7622L5.54099 11.0959C6.6184 10.3838 10.4228 5.69724 11.2168 5.47938C11.4259 5.42093 11.6138 5.43262 11.8006 5.54952L17.3501 9.03099C19.0007 8.05329 20.8084 7.34127 22.666 6.86836C22.9049 6.63243 23.6989 1.59621 24.0269 0.685455C24.1447 0.356014 24.1967 0.0350723 24.6128 3.8147e-06L32.7056 0.0797081L34.2384 6.72489C36.0599 7.41141 37.9006 7.99802 39.5799 9.00548L45.5104 5.45069L45.9435 5.54315L51.5588 11.2181L47.9837 17.2076C48.8053 19.0237 49.7107 20.7804 50.2128 22.7273L57 24.3862Z" fill="white"/>
        </svg>
    );
}

function Discord() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="72" height="52" viewBox="0 0 72 52" fill="none" style={{height: '70%', width: 'auto'}}>
            <path d="M46.0408 22.932C41.8808 23.3053 39.6835 27.824 40.6995 31.6133C41.9995 36.4653 47.8915 38.1867 51.2488 34.1987C54.8528 29.9187 51.9768 22.3987 46.0408 22.932ZM23.7075 22.932C19.1408 23.372 16.9955 28.7413 18.7581 32.6493C20.9301 37.468 27.3275 37.7187 29.7461 32.9733C32.0301 28.492 29.0768 22.4133 23.7075 22.932ZM26.0608 -7.62939e-06C26.0941 0.185326 26.7408 0.727989 26.6315 0.855991C22.2221 2.12399 17.9021 3.87599 14.0128 6.31866C12.9581 6.98266 11.9141 7.68799 10.9821 8.51332C13.0555 7.50266 15.1368 6.52399 17.3075 5.72932C25.7541 2.63199 35.9395 1.77466 44.7968 3.39866C49.8968 4.33332 54.8235 6.08533 59.3888 8.51466C59.4648 8.48533 59.3221 8.39732 59.2981 8.37732C58.5021 7.71732 57.5768 7.07332 56.7061 6.51332C53.0008 4.12666 48.8315 2.38132 44.6248 1.08532C44.5448 0.977325 45.3968 0.155994 45.4808 -7.62939e-06H45.7661L48.1288 0.237328C52.8061 0.895996 57.9768 3.06533 61.8008 5.81599C62.7115 6.47066 62.7928 6.64666 63.2941 7.63733C67.9648 16.8693 71.2835 29.732 71.4115 40.088C71.4128 40.184 71.3755 40.3413 71.4701 40.4013V42.172C67.9315 47.3987 61.7928 50.46 55.6115 51.2507L53.9915 51.4293H52.6781L48.6808 46.4867C49.3195 46.228 49.9901 46.0573 50.6355 45.8147C53.7515 44.648 57.0981 42.592 59.1875 39.9707C59.2448 39.9 59.6275 39.4133 59.5888 39.372C56.7795 41.2053 53.6955 42.592 50.5368 43.716C41.4528 46.9507 31.8848 46.9173 22.7048 44.0733C19.0475 42.94 15.4928 41.4253 12.2955 39.3147C12.2421 39.3747 12.8128 40.076 12.8941 40.1733C15.0141 42.7187 18.1701 44.6533 21.2488 45.8147C21.4608 45.8947 22.7848 46.2893 22.8048 46.3733L18.7501 51.4293H17.4355L15.8168 51.2507C10.4408 50.5587 5.00881 48.1173 1.41415 44.0013C0.916812 43.4347 0.494147 42.808 0.0141468 42.2293C0.0501468 41.224 -0.0311866 40.2053 0.0141468 39.2013C0.470147 29.416 3.08615 19.128 7.03015 10.1907C7.43148 9.28133 8.26481 7.19466 8.81948 6.49332C9.05015 6.20132 10.1981 5.46933 10.5741 5.22132C14.9421 2.33866 20.4581 0.235992 25.7181 -7.62939e-06H26.0608Z" fill="white"/>
        </svg>
    );
}

function HalfCart() {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg"
            width="238"
            height="271"
            viewBox="0 0 238 271"
            fill="none"
            style={{height: '90%', width: 'auto'}}
        >
            <path 
                opacity="0.4" 
                d="M0.0666667 244.84C0.173333 247.547 0.546667 250.2 1.13333 252.787C1.2 251.493 1.16 250.133 0.986667 248.707C0.813333 247.28 0.506667 246 0.0666667 244.84ZM144.867 101.427H108.613L113.987 60.3867H154.84L144.867 101.427ZM129.733 162.4H101.04L106.427 121.747H139.693L129.733 162.4ZM87.6933 101.427H54.4267V60.3867H93.0667L87.6933 101.427ZM80.72 162.4H54.8133V121.747H85.5067L80.72 162.4ZM34.4933 162.4H6.6L2.22667 121.747H34.4933V162.4ZM229.36 0L175.227 0.0933533C171.52 1.28 169.347 3.68002 168.093 7.30667C164.627 17.3467 163.387 29.3467 160.133 39.5867L159.027 40.8667L0.266667 40.8533C0.0933333 42.4667 0 44.1067 0 45.7733V60.3867H34.0933V100.427C34.0933 100.573 34.8 100.88 33.8933 101.427H0V182.72H124.547L116.32 215.013L0 215.027V234.52H95.2667C95.6133 234.52 97.3867 234.467 96.6533 235.307C82.8267 242.52 84.2267 263.667 98.6533 269.373C119.813 277.747 136.267 249.493 115.907 235.4C115.56 235.16 115.173 235.48 115.387 234.52H127.533C127.68 234.52 129.813 233.32 130.107 233.093C131.92 231.733 133.2 229.08 133.92 226.947L185.16 20.1867L227.173 20.16C239.493 19.1867 240.933 3.25333 229.36 0Z"
                fill="white"
            />
        </svg>
    );
}
