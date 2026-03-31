import { useEffect, useState } from 'react';
import { BlueprintMetadata } from '../../hooks/hooks';
import styles from './BlueprintStatusTracker.module.css';
import DomainDropdown from '../../shared/DomainDropdown';
import { inProgressStatus, queuedStatus, sentStatus } from '../../consts/images';


type BlueprintStatusTrackerProps = {
    blueprints: BlueprintMetadata[];
};

export default function BlueprintStatusTracker({
    blueprints,
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
            <img
                className={styles.statusImage}
                src={selectedBlueprint ? getStatusImageUrl(selectedBlueprint) : ''}
                alt="Status"
            />
        </div>
    );
}