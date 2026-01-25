import { View, Text, Image, Pressable } from 'react-native';
import React from 'react';
import styles from './styles';
import MainText from '../MainText';
import { COLORS, icons } from '../../constants';
import CustomView from '../customView';
import { getStatusStyle } from '../../utils/getStyle';
import { dateFormate } from '../../utils/formating/date';
import { maskId } from '../../utils/formating/string';

const DetailsCard = ({ long, status, item, onPress }) => {
  const statusStyle = getStatusStyle(status ?? item?.loanStatus);

  return (
    <Pressable style={styles.customView} onPress={onPress && onPress}>
      <View style={[styles.flex, { justifyContent: 'space-between' }]}>
        <View style={styles.statusContainer}>
          <MainText style={styles.idText}>Loan ID: </MainText>
          <MainText numberOfLines={1} style={styles.boldText}>
            {maskId(item?._id)}
          </MainText>
        </View>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBox,
              { backgroundColor: statusStyle.backgroundColor },
            ]}
          >
            <MainText style={styles.text}>{item?.loanStatus}</MainText>
          </View>
        </View>
      </View>
      <View
        style={[
          styles.flex,
          { justifyContent: 'space-between', alignItems: 'center' },
        ]}
      >
        <View style={styles.flex}>
          <Image source={icons.iphone} style={styles.iphone} />
          <MainText
            style={styles.modalText}
          >{`${item?.mobileBrand} ${item?.mobileModel}`}</MainText>
        </View>

        {onPress && (
          <Pressable onPress={onPress} style={styles.editBtn}>
            <MainText style={styles.editBtnText}>Edit</MainText>
            <Image source={icons.edit} style={styles.editIcon} />
          </Pressable>
        )}
      </View>

      {long ? (
        <>
          <CustomView
            label1="IMEI 1"
            value1={item?.imeiNumber1}
            label2="IMEI 2"
            value2={item?.imeiNumber2}
          />
          <CustomView
            label1="Mobile Price:"
            value1={item?.mobilePrice}
            label2="Processing Fees:"
            value2={item?.processingFees}
          />
          <CustomView
            label1="Down Payment:"
            value1={item?.downPayment}
            label2="Loan Amount:"
            value2={item?.loanAmount}
          />
          <CustomView
            label1="Installments Paid:"
            value1={`${item?.installmentsPaid}/${item?.numberOfEMIs}`}
            label2="EMI Amount:"
            value2={`${item?.emiAmount}/Monthly`}
          />
          <CustomView
            label1="EMI Start Date:"
            value1={dateFormate(item?.emiStartDate)}
            label2="EMI End Date:"
            value2={dateFormate(item?.emiEndDate)}
          />
          <CustomView
            label1="Amount Paid:"
            value1={item?.amountPaid}
            label2="Amount Left:"
            value2={item?.amountLeft}
          />
          <CustomView
            label1="Installation Type:"
            value1={item?.installationType}
          />
          <CustomView label1="Description:" value1={item?.description} />
        </>
      ) : (
        <>
          <CustomView
            label1="IMEI 1"
            value1={item?.imeiNumber1}
            label2="IMEI 2"
            value2={item?.imeiNumber2}
          />
          <CustomView
            label1="Installments Paid:"
            value1={`${item?.installmentsPaid}/${item?.numberOfEMIs}`}
            label2="EMI Amount:"
            value2={item?.loanAmount}
          />
          <CustomView label1="Loan Amount:" value1={item?.loanAmount} />
        </>
      )}
    </Pressable>
  );
};

export default DetailsCard;
