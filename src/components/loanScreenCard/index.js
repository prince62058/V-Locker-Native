import React from 'react';
import { View, Image, Text, Pressable } from 'react-native';
import styles from './styles';
import { COLORS, icons, SIZES } from '../../constants';
import MainText from '../MainText';
import { getStatusStyle } from '../../utils/getStyle';
import { maskId } from '../../utils/formating/string';
import { MEDIA_BASE_URL } from '../../services/axios/api';

const LoanScreenCard = ({ item, onPress }) => {
  const statusStyle = getStatusStyle(item?.loanStatus);
  console.log(
    'LoanCard:',
    item?.customerId?.customerName,
    item?.customerId?.profileUrl,
  );

  return (
    <Pressable style={styles.customView} onPress={onPress}>
      {/* Top Section */}
      <View
        style={[
          styles.flex,
          {
            justifyContent: 'space-between',
            marginBottom: SIZES.height * 0.014,
          },
        ]}
      >
        <View style={styles.flex}>
          <Image
            style={styles.profile}
            source={
              item?.customerId?.profileUrl
                ? { uri: `${MEDIA_BASE_URL}${item.customerId.profileUrl}` }
                : null
            }
          />
          <View style={styles.nameSection}>
            <MainText style={styles.boldText}>
              {item?.customerId?.customerName}
            </MainText>
            <MainText style={styles.text}>
              {item?.customerId?.customerMobileNumber}
            </MainText>
          </View>
        </View>
        <View style={styles.loanSection}>
          <MainText style={styles.idText}>LOAN ID</MainText>
          <MainText style={styles.text}>{maskId(item?._id)}</MainText>
        </View>
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        <MainText style={styles.loanText}>Loan Status:</MainText>
        <View
          style={[
            styles.statusBox,
            { backgroundColor: statusStyle.backgroundColor },
          ]}
        >
          <MainText style={styles.text}>{item?.loanStatus}</MainText>
        </View>
      </View>

      {/* Device Info Box */}
      <View style={styles.IMEIBox}>
        <View style={styles.flex}>
          <Image source={icons.iphone} style={styles.iphone} />
          <MainText
            style={styles.modalText}
          >{`${item?.mobileBrand} ${item?.mobileModel}`}</MainText>
        </View>

        <View style={styles.virtical}>
          <MainText style={styles.imeiText}>IMEI 1</MainText>
          <MainText style={styles.number}>{item?.imeiNumber1}</MainText>
        </View>

        <View style={styles.virtical}>
          <MainText style={styles.imeiText}>IMEI 2</MainText>
          <MainText style={styles.number}>{item?.imeiNumber2}</MainText>
        </View>
      </View>

      {/* Loan & EMI Info */}
      <View style={[styles.flex, { gap: SIZES.width * 0.03 }]}>
        <View style={styles.moneyBox}>
          <View style={styles.flex}>
            <Image source={icons.money} style={styles.iphone} />
            <MainText style={styles.moneyText}>Loan Amount</MainText>
          </View>
          <View style={styles.virtical}>
            <Text style={styles.number}>₹{item?.loanAmount}</Text>
          </View>
        </View>

        <View style={[styles.moneyBox, { borderColor: COLORS.primary300 }]}>
          <View style={styles.flex}>
            <Image source={icons.calendar} style={styles.iphone} />
            <MainText style={[styles.moneyText, { color: COLORS.primary400 }]}>
              EMI Amount
            </MainText>
          </View>
          <View style={styles.virtical}>
            <Text style={styles.number}>₹{item?.emiAmount}</Text>
            <MainText style={styles.number}>{item?.frequency}</MainText>
          </View>
        </View>
      </View>

      {/* Installments */}
      <View
        style={[
          styles.flex,
          { gap: SIZES.width * 0.015, marginTop: SIZES.height * 0.01 },
        ]}
      >
        <MainText style={styles.loanText}>Installments Paid:</MainText>
        <MainText
          style={styles.boldText}
        >{`${item?.installmentsPaid}/${item?.numberOfEMIs}`}</MainText>
      </View>
    </Pressable>
  );
};

export default LoanScreenCard;
